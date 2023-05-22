# frozen_string_literal: true

require 'digest/md5'

class PostCommentService < BaseService
  include Redisable
  
  def call(account, options = {})
    @account     = account
    @options     = options
    @text        = @options[:text] || ''
    @in_reply_to = @options[:thread]
    @comment_hash = Digest::MD5.new << @text unless @text.blank?

    set_source

    validate_blocked!(@in_reply_to)
    validate_user_confirmation!
    validate_attributes!
    validate_links! unless @account.user&.staff?
    validate_mention_count! unless @account.user&.staff?
    validate_copy_paste_spam! unless @account.user&.staff? || @account.vpdi?

    process_comment!
    bump_potential_friendship!

    @comment
  end

  private

  def set_source
    source = @options[:source]
    @sourceSym = Comment.sources[source.to_sym]

    if @sourceSym.nil?
      raise GabSocial::ValidationError, 'Invalid comment source.'
    end

    sourceId = @options[:source_id]
    removedSpacesSourceId = sourceId.gsub(/\s+/, "")
    if sourceId.nil? || sourceId.empty? || sourceId.blank? || removedSpacesSourceId.length == 0
      raise GabSocial::ValidationError, 'Invalid comment source.'
    end

    # : TODO :
    # make a POST to the source's service to validate source id
    # ... we dont want anyone to be able to send random string of characters and store that in the db
    # ... we want to make sure that it is a valid/public object
  end

  def validate_attributes!
    removedSpacesText = @text.gsub(/\s+/, "")
    if @text.empty? || @text.nil? || @text.blank? || removedSpacesText.length == 0
      raise GabSocial::ValidationError, 'You cannot post an empty comment.'
    end

    # : TODO :
    # if is a reply, ensure that the source and source id of the thread is the SAME!
  end

  def process_comment!
    ApplicationRecord.transaction do
      @comment = @account.comments.create!(comment_attributes)
    end

    ProcessCommentMentionsService.new.call(@comment)
  end

  def validate_blocked!(reply_comment)
    return unless reply_comment
    reply_account = reply_comment.account
    return validate_blocked!(reply_comment.thread) unless reply_account.blocking?(@account)
    raise GabSocial::NotPermittedError, "Cannot reply. @#{reply_account.username} has you blocked and you are trying to post undearneath one of their posts."
  end

  def validate_user_confirmation!
    return true if @account.user&.confirmed?
    raise GabSocial::NotPermittedError, 'Please confirm your email address before commenting'
  end

  def validate_copy_paste_spam!
    return true unless CopyPasteSpamService.new.is_comment_copy_paste_spam(@account.id, @comment_hash)
    raise GabSocial::NotPermittedError, 'Please do not copy and paste the same message over and over.'
  end

  def validate_links!
    return true unless LinkBlock.block?(@text)
    raise GabSocial::NotPermittedError, "A link you are trying to share has been flagged as spam, if you believe this is a mistake please contact support@gab.com and let us know."
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

  def bump_potential_friendship!
    return if !@comment.reply? || @account.id == @comment.in_reply_to_account_id
    # : todo :
    return if @account.following?(@comment.in_reply_to_account_id)
    PotentialFriendshipTracker.record(@account.id, @comment.in_reply_to_account_id, :reply)
  end

  def comment_attributes
    english = @account.user&.locale == 'en'
    lang = language_from_option(@options[:language])
    lang ||= english ? 'en' : nil
    lang ||= @account.user&.setting_default_language&.presence || LanguageDetector.instance.detect(@text, @account)
    {
      text: @text,
      thread: @in_reply_to,
      source: @sourceSym,
      source_id: @options[:source_id],
      language: lang,
    }.compact
  end

end
