# frozen_string_literal: true

class BlockWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'pull', retry: 2

  def perform(account_id, target_account_id)
    AfterBlockService.new.call(account_id, target_account_id)
  end
end
