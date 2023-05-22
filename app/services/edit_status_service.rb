# frozen_string_literal: true

class EditStatusService < BaseService
  include Redisable

  # copied from FetchLinkCardService
  URL_PATTERN = %r{
    (                                                                                                 #   $1 URL
      (https?:\/\/)                                                                                   #   $2 Protocol (required)
      (#{Twitter::Regex[:valid_domain]})                                                              #   $3 Domain(s)
      (?::(#{Twitter::Regex[:valid_port_number]}))?                                                   #   $4 Port number (optional)
      (/#{Twitter::Regex[:valid_url_path]}*)?                                                         #   $5 URL Path and anchor
      (\?#{Twitter::Regex[:valid_url_query_chars]}*#{Twitter::Regex[:valid_url_query_ending_chars]})? #   $6 Query String
    )
  }iox

  # Post a text status update, fetch and notify remote users mentioned
  # @param [Status] status Status being edited
  # @param [Hash] options
  # @option [String] :text Message
  # @option [String] :markdown Optional message in markdown
  # @option [Boolean] :sensitive
  # @option [String] :visibility
  # @option [String] :spoiler_text
  # @option [String] :language
  # @option [Enumerable] :media_ids Optional array of media IDs to attach
  # @option [Doorkeeper::Application] :application
  # @return [Status]
  def call(status, options = {})
    @status      = status
    @account     = status.account
    @options     = options
    @text        = Nokogiri::HTML(@options[:text] || '').text
    @markdown    = Nokogiri::HTML(@options[:markdown] || '').text

    set_status_context

    # validate_similarity! unless @account.user&.staff? || @account.vpdi?
    validate_links! unless @account.user&.staff?
    validate_mention_count! unless @account.user&.staff?
    validate_media!
    preprocess_attributes!
    revision_text = prepare_revision_text

    process_status!
    postprocess_status!
    create_revision! revision_text

    reset_status_cache

    @status
  end

  private

  def parse_urls
    urls = @text.scan(URL_PATTERN).map { |array| Addressable::URI.parse(array[0]).normalize }
    return urls.reject { |uri| bad_url?(uri) }.first
  end

  def bad_url?(uri)
    uri.host.blank? || !%w(http https).include?(uri.scheme)
  end

  def preprocess_attributes!
    @text         = @options.delete(:spoiler_text) if @text.blank? && @options[:spoiler_text].present?
    @visibility   = @options[:visibility] || @account.user&.setting_default_privacy
    @visibility   = :unlisted if @visibility == :public && @account.silenced?

    @expires_at = nil
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
  rescue ArgumentError
    raise ActiveRecord::RecordInvalid
  end

  def process_status!
    @status.update!(status_attributes)

    process_hashtags_service.call(@status)
    process_mentions_service.call(@status)
    process_links_service.call(@status)
  end

  def set_status_context
    if !@options[:status_context_id].nil?
      # : todo : if context id is associated with group, verify here
      @status_context = StatusContext.is_enabled.find(@options[:status_context_id])
    else
      @status_context = nil
    end
  end

  def postprocess_status!
    if !parse_urls.nil? || @status.preview_cards.any?
      LinkCrawlWorker.perform_async(@status.id) unless @status.spoiler_text?
    end
    ExpiringStatusWorker.perform_at(@status.expires_at, @status.id) if @status.expires_at
    # publish edits to recent statuses to altstream
    if @status.created_at > 8.hours.ago
      payload = InlineRenderer.render(@status, nil, :status)
      Redis.current.publish("altstream:main", Oj.dump(event: :edit_status, payload: payload))
    end
  end

  def prepare_revision_text
    text              = @status.text
    current_media_ids = @status.media_attachments.pluck(:id)
    new_media_ids     = (@options[:media_ids] || []).take(4).map(&:to_i)

    if current_media_ids.sort != new_media_ids.sort
      text = "" if text == @options[:text]
      text += " [Media attachments changed]"
    end
    if @options[:status_context_id] != @status.status_context_id
      text = "" if text == @options[:text]
      text += " [Status context changed]"
    end

    text.strip()
  end

  def create_revision!(text)
    @status.revisions.create!({
      text: text
    })
  end

  def validate_media!
    max_media = 8
    return if @options[:media_ids].blank? || !@options[:media_ids].is_a?(Enumerable)

    raise GabSocial::ValidationError, "Cannot attach more than #{max_media} files" if @options[:media_ids].size > max_media

    @media = @account.media_attachments.where(id: @options[:media_ids].take(max_media).map(&:to_i))
  end

  # def validate_similarity!
  #   return true unless StatusSimilarityService.new.call?(@text, @account.id)
  #   raise GabSocial::NotPermittedError, 'Spammy behavior detected!'
  # end

  def validate_links!
    return true unless LinkBlock.block?(@text)
    raise GabSocial::NotPermittedError, "A link you are trying to share has been flagged as spam, if you believe this is a mistake please contact support@gab.com and let us know."
  end

  def validate_mention_count!
    return true if @text.length < 8
    return true if @status.reply?
    return true unless @text.scan(Account::MENTION_RE).length > 8

    raise GabSocial::NotPermittedError, 'Too many @mentions in one post'
  end

  def language_from_option(str)
    ISO_639.find(str)&.alpha2
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

  def reset_status_cache
    Rails.cache.delete("statuses/#{@status.id}")
  end

  def status_attributes
    english = @account.user&.locale == 'en'
    lang = language_from_option(@options[:language])
    lang ||= english ? 'en' : nil
    lang ||= @account.user&.setting_default_language&.presence || LanguageDetector.instance.detect(@text, @account)
    {
      revised_at: Time.now,
      text: @text,
      markdown: @markdown,
      expires_at: @expires_at,
      status_context: @status_context || nil,
      media_attachments: @media || [],
      sensitive: (@options[:sensitive].nil? ? @account.user&.setting_default_sensitive : @options[:sensitive]) || @options[:spoiler_text].present?,
      spoiler_text: @options[:spoiler_text] || '',
      visibility: @visibility,
      language: lang,
      application: @options[:application],
    }
  end
end
