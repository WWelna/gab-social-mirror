# frozen_string_literal: true

class AuthorizeFollowWorker
  include Sidekiq::Worker

  def perform(source_account_id, target_account_id)
    @source_account = Account.find(source_account_id)
    @target_account = Account.find(target_account_id)

    AuthorizeFollowService.new.call(@source_account, @target_account)
  rescue ActiveRecord::RecordNotFound
    true
  rescue ActiveRecord::RecordInvalid
    FollowRequest.find_by(account: @source_account, target_account: @target_account)&.destroy!
    true
  end
end
