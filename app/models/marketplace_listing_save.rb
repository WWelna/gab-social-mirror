# == Schema Information
#
# Table name: marketplace_listing_saves
#
#  id                     :bigint(8)        not null, primary key
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  account_id             :bigint(8)        not null
#  marketplace_listing_id :bigint(8)        not null
#

class MarketplaceListingSave < ApplicationRecord
  include Paginable

  belongs_to :account
  belongs_to :marketplace_listing

  validates :marketplace_listing_id, uniqueness: { scope: :account_id }
end
