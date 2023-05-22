# == Schema Information
#
# Table name: marketplace_listing_categories
#
#  id                                  :bigint(8)        not null, primary key
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#  name                                :string           default(""), not null
#  slug                                :string           default(""), not null
#  description                         :string
#  cover_image_file_name               :string
#  cover_image_content_type            :string
#  cover_image_file_size               :bigint(8)
#  cover_image_updated_at              :datetime
#  parent_marketplace_listing_category :integer
#

class MarketplaceListingCategory < ApplicationRecord
  LIMIT = 2.megabytes
  
  has_attached_file :cover_image, styles: { static: { format: 'png', convert_options: '-coalesce -strip' } }
  validates_attachment :cover_image, content_type: { content_type: 'image/png' }, presence: true, size: { less_than: LIMIT }

  include Attachmentable

  scope :alphabetical, -> { order(name: :asc) }

end
