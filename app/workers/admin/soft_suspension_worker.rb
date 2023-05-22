# frozen_string_literal: true

class Admin::SoftSuspensionWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'pull', retry: 0

  def perform(account_id)
    SoftSuspendAccountService.new.call(Account.find(account_id))
  end
end
