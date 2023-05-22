# frozen_string_literal: true

class PostChatMessageService < BaseService


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

  def call(account, options = {})
    @account = account

    @options = options
    @text = options[:text] || ''
    @chat_conversation_account = options[:chat_conversation_account]
    @marketplace_listing = options[:marketplace_listing]

    # strip tags, ensure conversation exists
    preprocess_attributes!

    validate!
    validate_media!

    set_chat_conversation_participants!

    create_chat!
    postprocess_chat!
    update_conversation
    upate_marketplace_listing_conversation

    @chat
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
    @text = ActionController::Base.helpers.strip_tags(@text)
    unless @chat_conversation_account
      raise ActiveRecord::RecordInvalid
    end
  rescue ArgumentError
    raise ActiveRecord::RecordInvalid
  end

  def validate!
    # if email is not confirmed, do not allow
    if !@account.user&.confirmed?
      raise GabSocial::NotPermittedError, "Please confirm your email before sending chats"
    end

    if @text.blank? && @options[:media_ids].nil?
      raise GabSocial::NotPermittedError, 'Message required'
    end

    if ENV['AUTHCODE_FROM_USER']
      if @account.username == ENV['AUTHCODE_FROM_USER']
        return
      end
    end

    if !@account.is_pro? && ChatMessageSimilarityService.new.call?(@text, @account.id)
      raise GabSocial::NotPermittedError, 'Spammy behavior detected!'
    end

    if LinkBlock.block?(@text)
      raise GabSocial::NotPermittedError, "A link you are trying to share has been flagged as spam, if you believe this is a mistake please contact support@gab.com and let us know."
    end
  end

  def validate_media!
    max_media = 8
    return if @options[:media_ids].blank? || !@options[:media_ids].is_a?(Enumerable)

    raise GabSocial::ValidationError, "Cannot attach more than #{max_media} files" if @options[:media_ids].size > max_media

    # Check Image Blocks for each media fingerprint md5
    @options[:media_ids].each do |media_id|
      media = MediaAttachment.find(media_id)
      if media.image? && ImageBlock.where(md5: media.file_fingerprint).exists?
        raise GabSocial::ValidationError, 'Media could not be attached.'
      end
    end

    @media = @account.media_attachments.unattached.where(id: @options[:media_ids].take(max_media).map(&:to_i))
  end

  def set_chat_conversation_participants!
    @chat_conversation_participants_accounts = ChatConversationAccount.where(chat_conversation: @chat_conversation_account.chat_conversation)
  rescue ArgumentError
    raise ActiveRecord::RecordInvalid
  end

  def create_chat!
    @chat = ChatMessage.create!(
      from_account: @account,
      chat_conversation: @chat_conversation_account.chat_conversation,
      text: @text,
      expires_at: message_expiration,
      media_attachments: @media || [],
    )
  end

  def postprocess_chat!
    if !parse_urls.nil?
      ChatMessageLinkCrawlWorker.perform_async(@chat.id)
    end

    @chat_conversation_participants_accounts.each do |participant|
      # get not mine
      if @chat_conversation_account.id != participant.id
        # check if participant is blocking me
        # we DO still let the message go through but the blocker wont get it unless they unblock
        unless participant.account.chat_blocking?(@account) || participant.account.blocking?(@account)
          # if not blocked, on the chat_conversation_account object we...
          # - increment unread count
          participant.unread_count = participant.unread_count + 1
          # - set the is_hidden to false in order for all participants to view it
          participant.is_hidden = false

          # check if muting
          unless participant.is_muted
            # not muting, so we push it via socket
            payload = InlineRenderer.render(@chat, participant.account, :chat_message)
            Redis.current.publish("chat_messages:#{participant.account.id}", Oj.dump(event: :notification, payload: payload))
          end
        end
      else
        # if IS mine, we reset unread_count and is_hidden value
        participant.unread_count = 0
        participant.is_hidden = false
      end

      # save the chat_conversation_account object
      participant.save
    end
  end

  def update_conversation
    @chat_conversation_account.chat_conversation.update(
      last_chat_message_id: @chat.id,
      last_chat_message_sent_at: @chat.created_at,
    )
  end

  def upate_marketplace_listing_conversation
    return if @marketplace_listing.nil?

    existing_marketplace_listing_convo = MarketplaceListingChatConversation.where(
      marketplace_listing_id: @marketplace_listing.id,
      chat_conversation_id: @chat_conversation_account.chat_conversation.id,
    ).count

    # return if already have conversation with this listing
    return if existing_marketplace_listing_convo > 0

    MarketplaceListingChatConversation.create(
      marketplace_listing_id: @marketplace_listing.id,
      chat_conversation_id: @chat_conversation_account.chat_conversation.id,
      chat_message_id: @chat.id,
    )
  rescue ArgumentError
    raise ActiveRecord::RecordInvalid
  end

  def message_expiration
    @chat_conversation_account.chat_message_expiration_policy_duration&.from_now
  end

end
