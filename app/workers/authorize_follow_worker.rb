# frozen_string_literal: true

class AuthorizeFollowWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'pull', retry: 2

  def perform(source_account_id, target_account_id)
    @source_account = Account.find_by(id: source_account_id)
    @target_account = Account.find_by(id: target_account_id)
    return if @source_account.nil? || @target_account.nil?

    AuthorizeFollowService.new.call(@source_account, @target_account)
  rescue ActiveRecord::RecordNotFound
    true
  rescue ActiveRecord::RecordInvalid
    FollowRequest.find_by(account: @source_account, target_account: @target_account)&.destroy!
    true
  end
end
