# frozen_string_literal: true

class Admin::UndoSoftSuspensionWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'pull', retry: 0

  def perform(account_id)
    UndoSoftSuspendAccountService.new.call(Account.find(account_id))
  end
end
