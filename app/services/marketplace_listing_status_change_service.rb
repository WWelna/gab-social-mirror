# frozen_string_literal: true

class MarketplaceListingStatusChangeService < BaseService
  def call(marketplaceListing, newStatus, note = nil, account = nil)
    @marketplaceListing = marketplaceListing
    @oldStatus = marketplaceListing.status.to_sym
    @newStatus = newStatus.to_sym
    @note = note
    @account = account

    validate_attributes!

    MarketplaceListingStatusChange.create(change_attributes)

    marketplaceListing.update!(status: @newStatus)

    true
  end

  private

  def validate_attributes!
    return true if !@account.nil? && @account.user&.staff?

    # 
    if @oldStatus == :pending_admin_review ||
       @oldStatus == :pending_user_changes ||
       @oldStatus == :expired

      if @newStatus == :sold ||
         @newStatus == :archived
        return true
      else
        raise GabSocial::NotPermittedError, "You are only able to change your listing status from Pending or Expired to Sold or Archived."
        return false
      end
    end

    # 
    if @oldStatus == :rejected ||
       @oldStatus == :sold

      if @newStatus == :archived
        return true
      else
        raise GabSocial::NotPermittedError, "You are only able to change your listing status from Rejected or Sold to Archived."
        return false
      end
    end
    
    # 
    if @oldStatus == :approved
      
      if @newStatus == :running ||
         @newStatus == :sold ||
         @newStatus == :archived
         return true
      else
        raise GabSocial::NotPermittedError, "You are only able to change your listing status from Approved to Running, Sold or Archived."
        return false
      end
    end

    # 
    if @oldStatus == :running
      
      if @newStatus == :approved ||
         @newStatus == :sold ||
         @newStatus == :archived
         return true
      else
        raise GabSocial::NotPermittedError, "You are only able to change your listing status from Running to Approved, Sold or Archived."
        return false
      end
    end
  
    # default is error because only the above circumstances return true
    raise GabSocial::NotPermittedError, "You cannot change your listing status to something else."
  end

  def change_attributes
    {
      marketplace_listing: @marketplaceListing,
      old_status: @oldStatus,
      new_status: @newStatus,
      note: @note,
      reviewer_account_id: (!defined?(@account) || @account.nil?) ? nil : @account.id
    }.compact
  end
end
