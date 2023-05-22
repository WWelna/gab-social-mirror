# == Schema Information
#
# Table name: marketplace_listing_runtimes
#
#  id                     :bigint(8)        not null, primary key
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  seconds                :bigint(8)        default(0), not null
#  marketplace_listing_id :bigint(8)        not null
#

class MarketplaceListingRuntime < ApplicationRecord

end
