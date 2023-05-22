# frozen_string_literal: true

require 'digest/md5'

class PostStatusService < BaseService
  include Redisable

  MIN_SCHEDULE_OFFSET = 5.minutes.freeze

  # Post a text status update, fetch and notify remote users mentioned
  # @param [Account] account Account from which to post
  # @param [Hash] options
  # @option [String] :text Message
  # @option [String] :markdown Optional message in markdown
  # @option [Status] :thread Optional status to reply to
  # @option [Boolean] :sensitive
  # @option [String] :visibility
  # @option [String] :spoiler_text
  # @option [String] :language
  # @option [String] :scheduled_at
  # @option [String] :expires_at
  # @option [Hash] :poll Optional poll to attach
  # @option [Enumerable] :media_ids Optional array of media IDs to attach
  # @option [Doorkeeper::Application] :application
  # @option [String] :group Optional group id
  # @return [Status]
  def call(account, options = {})
    @account     = account
    @options     = options
    @text        = @options[:text] || ''
    @markdown    = @options[:markdown] if @account.is_pro
    @in_reply_to = @options[:thread]
    @auto_join_group = @options[:autoJoinGroup] || false
    @status_hash = Digest::MD5.new << @text unless @text.blank?

    set_group

    validate_blocked!(@in_reply_to)
    validate_user_confirmation!
    validate_links! unless @account.user&.staff?
    validate_mention_count! unless @account.user&.staff?
    validate_media!
    validate_group!
    #validate_similarity! unless @account.user&.staff? || @account.vpdi?
    validate_copy_paste_spam! unless @text.blank? || @account.user&.staff? || @account.vpdi?
    preprocess_attributes!

    if scheduled?
      schedule_status!
    else
      process_status!
      postprocess_status!
      bump_potential_friendship!
      potentially_reset_parent_cache
    end

    @status
  end

  private

  def set_group
    # If this is a reply, we want the group to be the same group that the status we're
    # replying to has set to keep a consistent thread.
    #
    # If it's not a reply, use the group_id from options, since this is a top-level status.

    if @in_reply_to
      @group = @in_reply_to.group
    elsif (group_id = @options[:group_id]).present?
      @group = Group.find(group_id)
    end

    # Write `group_id` back into `@options`, since scheduled statuses uses it
    @options[:group_id] = @group&.id
  end

  def preprocess_attributes!
    @text         = @options.delete(:spoiler_text) if @text.blank? && @options[:spoiler_text].present?

    if @group&.is_private?
      @visibility = :private_group
    else
      @visibility = @options[:visibility] || @account.user&.setting_default_privacy
      @visibility = :unlisted if @visibility == :public && @account.silenced?
    end

    @expires_at = nil
    if @account.is_pro
      case @options[:expires_at]
        when 'five_minutes'
          @expires_at = Time.now + 5.minutes
        when 'one_hour'
          @expires_at = Time.now + 1.hour
        when 'six_hours'
          @expires_at = Time.now + 6.hours
        when 'one_day'
          @expires_at = Time.now + 1.day
        when 'three_days'
          @expires_at = Time.now + 3.days
        when 'one_week'
          @expires_at = Time.now + 1.week
      end
    end
    @scheduled_at = @options[:scheduled_at]&.to_datetime
    @scheduled_at = nil if scheduled_in_the_past?

    if (quote_id = @options.delete(:quote_of_id))
      begin
        @options[:quote] = Status.find(quote_id)
      rescue ActiveRecord::RecordNotFound
        raise GabSocial::ValidationError, 'The Gab you are trying to quote could not be found. It may have been deleted.'
      end
    end
  rescue ArgumentError
    raise ActiveRecord::RecordInvalid
  end

  def process_status!
    # The following transaction block is needed to wrap the UPDATEs to
    # the media attachments when the status is created

    ApplicationRecord.transaction do
      @status = @account.statuses.create!(status_attributes)
    end

    process_hashtags_service.call(@status)
    process_mentions_service.call(@status)
    process_links_service.call(@status)
    if @status.quote
      process_quote_service.call(@status)
    end
  end

  def schedule_status!
    status_for_validation = @account.statuses.build(status_attributes)

    if status_for_validation.valid?
      status_for_validation.destroy

      # The following transaction block is needed to wrap the UPDATEs to
      # the media attachments when the scheduled status is created

      ApplicationRecord.transaction do
        @status = @account.scheduled_statuses.create!(scheduled_status_attributes)
      end
    else
      raise ActiveRecord::RecordInvalid
    end
  end

  def postprocess_status!
    LinkCrawlWorker.perform_async(@status.id)
    # DistributionWorker.perform_async(@status.id)
    ExpiringStatusWorker.perform_at(@status.expires_at, @status.id) if @status.expires_at && @account.is_pro
    PollExpirationNotifyWorker.perform_at(@status.poll.expires_at, @status.poll.id) if @status.poll
  end

  def potentially_reset_parent_cache
    if !@status.quote_of_id.nil?
      Rails.cache.delete("statuses/#{@status.quote_of_id}")
    elsif !@status.in_reply_to_id.nil?
      Rails.cache.delete("statuses/#{@status.in_reply_to_id}")
    end
  end

  def validate_group!
    # If there's no group, there's nothing to validate
    return if @group.blank?

    # If you were kicked out of the group, you're not allowed to post. Game Over.
    if GroupRemovedAccount.where(account: @account, group: @group).exists?
      raise GabSocial::ValidationError, I18n.t('statuses.not_a_member_of_group')
    end

    # Public groups can be posted in by anyone.
    return if !@group.is_private?

    # You have to be a member of a private group to post in it. 
    unless GroupAccount.where(account: @account, group: @group).exists?
      raise GabSocial::ValidationError, I18n.t('statuses.not_a_member_of_group')
    end
  end

  def validate_blocked!(reply_status)
    return unless reply_status
    reply_account = reply_status.account
    return validate_blocked!(reply_status.thread) unless reply_account.blocking?(@account)

    raise GabSocial::NotPermittedError, "Cannot reply. @#{reply_account.username} has you blocked and you are trying to post undearneath one of their posts."
  end

  def validate_media!
    return if @options[:media_ids].blank? || !@options[:media_ids].is_a?(Enumerable)

    raise GabSocial::ValidationError, I18n.t('media_attachments.validations.too_many') if @options[:media_ids].size > 4

    # Check Image Blocks for each media fingerprint md5
    @options[:media_ids].each do |media_id|
      media = MediaAttachment.find(media_id)
      if media.image? && ImageBlock.where(md5: media.file_fingerprint).exists?
        raise GabSocial::ValidationError, 'Media could not be attached.'
      end
    end

    @media = @account.media_attachments.where(status_id: nil).where(id: @options[:media_ids].take(4).map(&:to_i))

    hasVideoOrGif = @media.find(&:video?) || @media.find(&:gifv?)
    raise GabSocial::ValidationError, I18n.t('media_attachments.validations.images_and_video') if @media.size > 1 && hasVideoOrGif
  end

  def validate_user_confirmation!
    return true if @account.user&.confirmed?

    # do not allow statuses with mentions and not reply
    has_mentions = !@text.match(Account::MENTION_RE).nil?
    if has_mentions && @in_reply_to.nil?
      raise GabSocial::NotPermittedError, 'Please confirm your email address to @mention accounts'
    end

    # the only group unconfirmed accounts are allowed to post in is the "introduce yourself" group
    if @group && @group.id != 12
      raise GabSocial::NotPermittedError, 'Please confirm your email address to post in a group'
    end
  end

  # def validate_similarity!
  #   return true unless StatusSimilarityService.new.call?(@text, @account.id)
  #   raise GabSocial::NotPermittedError, 'Spammy behavior detected!'
  # end

  def validate_copy_paste_spam!
    return true unless CopyPasteSpamService.new.is_copy_paste_spam(@account.id, @status_hash)
    raise GabSocial::NotPermittedError, 'Please do not copy and paste the same message over and over.'
  end

  def validate_links!
    return true unless LinkBlock.block?(@text)
    raise GabSocial::NotPermittedError, "A link you're trying to post has been blocked by the moderation team"
  end

  def validate_mention_count!
    return true if @text.length < 8
    return true if !@in_reply_to.nil?
    return true unless @text.scan(Account::MENTION_RE).length > 8

    raise GabSocial::NotPermittedError, 'Too many @mentions in one post'
  end

  def language_from_option(str)
    ISO_639.find(str)&.alpha2
  end

  def process_quote_service
    ProcessQuoteService.new
  end

  def process_mentions_service
    ProcessMentionsService.new
  end

  def process_hashtags_service
    ProcessHashtagsService.new
  end

  def process_links_service
    ProcessLinksService.new
  end

  def scheduled?
    return false unless @account.is_pro
    @scheduled_at.present?
  end

  def scheduled_in_the_past?
    @scheduled_at.present? && @scheduled_at <= Time.now.utc + MIN_SCHEDULE_OFFSET
  end

  def bump_potential_friendship!
    return if !@status.reply? || @account.id == @status.in_reply_to_account_id
    # ActivityTracker.increment('activity:interactions')
    return if @account.following?(@status.in_reply_to_account_id)
    PotentialFriendshipTracker.record(@account.id, @status.in_reply_to_account_id, :reply)
  end

  def status_attributes
    {
      text: @text,
      markdown: @markdown,
      expires_at: @expires_at,
      group: @group,
      quote: @options[:quote],
      media_attachments: @media || [],
      thread: @in_reply_to,
      poll_attributes: poll_attributes,
      sensitive: (@options[:sensitive].nil? ? @account.user&.setting_default_sensitive : @options[:sensitive]) || @options[:spoiler_text].present?,
      spoiler_text: @options[:spoiler_text] || '',
      visibility: @visibility,
      language: language_from_option(@options[:language]) || @account.user&.setting_default_language&.presence || LanguageDetector.instance.detect(@text, @account),
      application: @options[:application],
    }.compact
  end

  def scheduled_status_attributes
    {
      scheduled_at: @scheduled_at,
      media_attachments: @media || [],
      params: scheduled_options,
    }
  end

  def poll_attributes
    return if @options[:poll].blank?

    @options[:poll].merge(account: @account)
  end

  def scheduled_options
    @options.tap do |options_hash|
      options_hash[:in_reply_to_id] = options_hash.delete(:thread)&.id
      options_hash[:application_id] = options_hash.delete(:application)&.id
      options_hash[:quote_of_id]    = options_hash.delete(:quote)&.id
      options_hash[:scheduled_at]   = nil
    end
  end
end
