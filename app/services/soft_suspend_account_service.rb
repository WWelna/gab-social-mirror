# frozen_string_literal: true

# don't delete anything, just set flags
class SoftSuspendAccountService < BaseService
  
  def call(account)
    @account = account
    return true if @account.is_pro? || @account.is_verified? || @account.is_donor? || @account.is_investor?

    @account.suspended_at = Time.now.utc
    @account.user.disable!
    @account.save!

    gmes = GroupModerationEvent.where(account_id: @account.id).where(acted_at: nil)
    gmes.update_all(acted_at: Time.now, rejected: true)
    gms = GroupModerationStatus.where(account_id: @account.id)
    gms.destroy_all

    @account.statuses.reorder(nil).find_in_batches do |statuses|
      BatchedTombstoneStatusService.new.call(statuses)
    end

    Report.where(target_account: @account).unresolved.update_all(action_taken: true)
  end

end
