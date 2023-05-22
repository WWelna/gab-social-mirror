# == Schema Information
#
# Table name: marketplace_listing_status_changes
#
#  id                     :bigint(8)        not null, primary key
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  marketplace_listing_id :bigint(8)        not null
#  old_status             :integer          default("pending_admin_review"), not null
#  new_status             :integer          default("pending_admin_review"), not null
#  note                   :string
#  reviewer_account_id    :bigint(8)
#

class MarketplaceListingStatusChange < ApplicationRecord
  include Paginable

  enum new_status: MarketplaceListing.statuses, _suffix: 'new'
  enum old_status: MarketplaceListing.statuses, _suffix: 'old'

  has_one :account, class_name: 'Account', primary_key: :reviewer_account_id, foreign_key: :reviewer_account_id
  belongs_to :marketplace_listing, inverse_of: :marketplace_listing_status_changes

  scope :old_and_new_running, -> { where(old_status: :running).or(where(new_status: :running)) }
  scope :oldest, -> { reorder(id: :asc) }

  def new_status_s
    case new_status.to_sym
    when :pending_admin_review
      return "Pending Review"
    when :pending_user_changes
      return "Pending Changes"
    when :rejected
      return "Rejected"
    when :approved
      return "Approved"
    when :running
      return "Running"
    when :expired
      return "Expired"
    when :sold
      return "Sold"
    when :archived
      return "Archived"
    else
      ""
    end
  end

  def old_status_s
    case old_status.to_sym
    when :pending_admin_review
      return "Pending Review"
    when :pending_user_changes
      return "Pending Changes"
    when :rejected
      return "Rejected"
    when :approved
      return "Approved"
    when :running
      return "Running"
    when :expired
      return "Expired"
    when :sold
      return "Sold"
    when :archived
      return "Archived"
    else
      ""
    end
  end

end
