# frozen_string_literal: true

class BlockChatMessengerService < BaseService
  def call(account, target_account)
    # cant block yourself
    return if account.id == target_account.id

    block = account.chat_block!(target_account)
    block
  end
end
