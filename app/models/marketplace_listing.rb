# == Schema Information
#
# Table name: marketplace_listings
#
#  id                              :bigint(8)        not null, primary key
#  created_at                      :datetime         not null
#  updated_at                      :datetime         not null
#  title                           :string           default(""), not null
#  description                     :string
#  tags                            :string           is an Array
#  location                        :string
#  status                          :integer          default("pending_admin_review"), not null
#  condition                       :integer          default("new"), not null
#  price                           :decimal(, )      default(0.0), not null
#  account_id                      :bigint(8)        not null
#  marketplace_listing_category_id :bigint(8)
#  is_shipping_required            :boolean
#

class MarketplaceListing < ApplicationRecord
  include Paginable
  include Cacheable

  enum status: {
    pending_admin_review: 0, # user submitted something for review by admin
    pending_user_changes: 1, # admin sent back things for user to change
    rejected: 2, # admin nuked this entire listing. user is only able to archive listing from here
    approved: 3, # approved by admin and ready for user to turn to "running"
    running: 4, # running and visible to world. can mark as "sold", or edit it, or change turn off by going back to "approved".
    expired: 5, # listing has spent its MAX_MARKETPLACE_LISTING_RUNTIME_DAYS running from first time it started running, can be marked as sold or archive from here
    sold: 6, # marked as sold by user, able to open again if not past MAX_MARKETPLACE_LISTING_RUNTIME_DAYS for total running period
    archived: 7 # archived/deleted and not able to open again. only able to do this if listing is expired/rejected/sold not able to change status anymore
  }, _suffix: 'status'

  # MAX_MARKETPLACE_LISTING_RUNTIME_DAYS lifestyle is total time spent in "running" as determined by tallying up dates in status_changes records

  enum condition: {
    new: 0,
    renewed: 1,
    used_like_new: 2,
    used_very_good: 3,
    used_good: 4,
    used_acceptable: 5,
  },
  _suffix: 'condition'

  scope :recent, -> { reorder(id: :desc) }
  scope :oldest, -> { reorder(id: :asc) }
  scope :alphabetical, -> { order(name: :asc) }
  scope :only_running, -> { where(status: :running) }
  scope :active, -> { where(status: [:running, :sold, :pending_user_changes, :pending_admin_review, :rejected, :approved]) }

  belongs_to :account
  belongs_to :marketplace_listing_category, optional: false, foreign_key: 'marketplace_listing_category_id'
  has_many :media_attachments, dependent: :nullify
  has_many :marketplace_listing_saves, inverse_of: :marketplace_listing, dependent: :destroy
  has_many :marketplace_listing_status_changes, inverse_of: :marketplace_listing, dependent: :destroy

  cache_associated :media_attachments

  validates_with MarketplaceListingValidator
  validates_with MarketplaceListingLimitValidator
  
  def runtime_seconds
    # join
    0
  end

  def cache_key
    "marketplace_listing/#{id}-#{cache_version}"
  end

  def runtime_seconds_readable
    time = runtime_seconds
    if time >= 86400
      return "#{time / 86400} days"
    elsif time >= 3600 && time < 86400
      return "#{time / 86400} hours"
    elsif time >= 60 && time < 3600
      return "#{time / 86400} minutes"
    else 
      return "#{time} seconds"
    end
  end

  def is_expired?
    # : todo :
    status.to_sym == :expired || runtime_seconds >= 30 # MAX_MARKETPLACE_LISTING_RUNTIME_DAYS
  end
  
  def is_running?
    status.to_sym == :running
  end

  def with_media?
    media_attachments.any?
  end

  def status_s
    case status.to_sym
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
  
  private

  # 

end
