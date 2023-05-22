# frozen_string_literal: true

class BatchedRemoveStatusesWorker
  include Sidekiq::Worker
  
  sidekiq_options queue: 'pull', retry: 5

  def perform(account_id, status_ids)
    account = Account.find(account_id)
    
    return if account.nil?

    account.statuses.where(id: status_ids).reorder(nil).find_in_batches do |statuses|
      BatchedRemoveStatusService.new.call(statuses, account, skip_side_effects: true)
    end

    account_stat = AccountStat.where(account_id: account.id).first
    if !account_stat.nil?
      account_stat.resync!(reload: false)
    end

    return true
  end
end
