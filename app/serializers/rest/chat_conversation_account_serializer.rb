# frozen_string_literal: true

class REST::ChatConversationAccountSerializer < ActiveModel::Serializer
  attributes :id, :is_hidden, :is_approved, :unread_count,
             :is_unread, :chat_conversation_id, :created_at,
             :is_muted, :is_pinned, :chat_message_expiration_policy,
             :last_chat_message, :last_chat_message_sent_at, :is_group_chat

  has_many :participant_accounts, key: :other_accounts, serializer: REST::AccountSerializer

  def id
    object.id.to_s
  end

  def chat_conversation_id
    object.chat_conversation_id.to_s
  end

  def is_unread
    object.unread_count > 0
  end

  def chat_message_expiration_policy
    object.chat_message_expiration_policy_name
  end

  def last_chat_message_sent_at
    object.chat_conversation.last_chat_message_sent_at
  end

  def last_chat_message
    if object.chat_conversation.last_chat_message_id
      ActiveModelSerializers::SerializableResource.new(
        object.chat_conversation.last_chat_message,
        serializer: REST::ChatMessageSerializer
      )
    else
      nil
    end
  end

  def is_group_chat
    object.is_group_chat?
  end

end
