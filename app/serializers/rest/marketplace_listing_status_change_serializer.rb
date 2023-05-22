# frozen_string_literal: true

class REST::MarketplaceListingStatusChangeSerializer < ActiveModel::Serializer
  attributes :created_at, :marketplace_listing_id, :old_status_s, :new_status_s, 
             :old_status_i, :new_status_i, :admin_changed, :note, :is_current

  def marketplace_listing_id
    object.marketplace_listing_id
  end

  def admin_changed
    # : todo : 
    # if !object.reviewer_account_id.nil?
    #   reutrn object.reviewer_account_id&.staff?
    # end

    false
  end

  def old_status_i
    MarketplaceListing.statuses[object.old_status]
  end
  
  def old_status_s
    object.old_status_s
  end

  def new_status_i
    MarketplaceListing.statuses[object.new_status]
  end
  
  def new_status_s
    object.new_status_s
  end

  def is_current
    false
  end

end
