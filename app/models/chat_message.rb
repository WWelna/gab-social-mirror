# frozen_string_literal: true
# == Schema Information
#
# Table name: chat_messages
#
#  id                   :bigint(8)        not null, primary key
#  language             :text             default(""), not null
#  from_account_id      :integer          not null
#  chat_conversation_id :bigint(8)        not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  expires_at           :datetime
#  text_ciphertext      :text
#

class ChatMessage < ApplicationRecord
  include Paginable

  encrypts :text

  belongs_to :from_account, class_name: 'Account'
  belongs_to :chat_conversation
  
  has_and_belongs_to_many :media_attachments
  has_and_belongs_to_many :preview_cards

  validates_with ChatMessageLengthValidator
  validates_with ChatMessageLimitValidator
  
  default_scope { recent }

  scope :expired, -> { where.not(expires_at: nil).where('expires_at < ?', Time.now.utc) }
  scope :recent, -> { reorder(created_at: :desc) }

  def emojis
    return @emojis if defined?(@emojis)

    @emojis = CustomEmoji.from_text(text)
  end

  def preview_card
    preview_cards.first
  end
end
