# frozen_string_literal: true

class REST::ChatMessageSerializer < ActiveModel::Serializer
  attributes :id, :text_html, :text, :language, :from_account_id,
             :chat_conversation_id, :created_at, :expires_at

  has_many :media_attachments, serializer: REST::MediaAttachmentSerializer
  has_one :preview_card, key: :card, serializer: REST::PreviewCardSerializer
  
  def id
    object.id.to_s
  end
  
  def text
    blocked_by_messager = false
    if instance_options && instance_options[:relationships]
      blocked_by_messager = instance_options[:relationships].blocked_by_map[object.from_account_id] || false
    end

    if blocked_by_messager
      '[HIDDEN – USER BLOCKS YOU]'
    else
      object.text
    end
  end

  def text_html
    blocked_by_messager = false
    if instance_options && instance_options[:relationships]
      blocked_by_messager = instance_options[:relationships].blocked_by_map[object.from_account_id] || false
    end

    if blocked_by_messager
      '[HIDDEN – USER BLOCKS YOU]'
    else
      Formatter.instance.chatMessageText(object).strip
    end
  end

  def from_account_id
    object.from_account_id.to_s
  end

  def chat_conversation_id
    object.chat_conversation_id.to_s
  end

end
