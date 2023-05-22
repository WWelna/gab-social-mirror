# frozen_string_literal: true

class MarketplaceListingPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    # if staff, show all, if own, show all
    return true if staff? || owned?

    # dont allow if blocked by owner
    
    # else show only running
    record.is_running?
  end

  def create?
    pro?
  end
  
  def update?
    # only allow staff and owner to update
    return true if staff? || (owned? && pro?)
    false
  end

  def destroy?
    # only allow staff and owner to destroy
    return true if staff? || owned?
    false
  end

  private

  def pro?
    current_account&.is_pro?
  end

  def owned?
    record.account_id == current_account&.id
  end

end
