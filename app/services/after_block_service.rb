# frozen_string_literal: true

class AfterBlockService < BaseService
  def call(account_id, target_account_id)
    Notification.where(
      account_id: account_id, from_account_id: target_account_id
    ).delete_all
  end
end
