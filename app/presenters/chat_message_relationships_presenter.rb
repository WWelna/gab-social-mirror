# frozen_string_literal: true

class ChatMessageRelationshipsPresenter
  attr_reader :blocked_by_map

  def initialize(chat_messages, current_account_id = nil, **options)
    chat_messages = chat_messages.compact
    chat_message_ids = chat_messages.map(&:id).uniq.compact

    if current_account_id.nil? || chat_messages.empty?
      @blocked_by_map = {}
    else
      chat_message_account_ids = chat_messages.map(&:from_account_id).compact.uniq.reject { |account_id| account_id.to_s == current_account_id.to_s }

      @blocked_by_map = Account.blocked_by_map(chat_message_account_ids, current_account_id)
    end
  end
end
