# frozen_string_literal: true

# don't delete anything, just set flags
class UndoSoftSuspendAccountService < BaseService
  
  def call(account)
    @account = account

    @account.suspended_at = nil
    @account.user.enable!
    @account.save!
    
    Status.unscoped.where(account: @account).reorder(nil).find_in_batches do |statuses|
      BatchedUntombstoneStatusService.new.call(statuses)
    end
  end

end
