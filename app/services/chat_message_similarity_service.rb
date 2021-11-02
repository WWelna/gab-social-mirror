# frozen_string_literal: true

require 'similar_text'

class ChatMessageSimilarityService < BaseService
  def call?(chat_message_text = "", account_id = nil)
    @chat_message_text = chat_message_text
    @account_id = account_id

    # Not alike if no chat_message_text or no account
    return false if @chat_message_text.length == 0 || @account_id.nil?

    alike?
  end

  def clear(account)
    return if account.nil?

    key = "last_chat_from_account:#{account.id}"

    Redis.current.with do |conn|
      conn.del(key)
    end
  end

  private

  def alike?
    last_chat_message_text = nil
    key = "last_chat_from_account:#{@account_id}"

    Redis.current.with do |conn|
      last_chat_message_text = conn.get(key) || ""
      conn.setex(key, 300, @chat_message_text)
    end

    if last_chat_message_text.nil? || last_chat_message_text.empty? || last_chat_message_text.length == 0
      return false
    end

    likeness = last_chat_message_text.similar(@chat_message_text)

    likeness > 85
  end

end
