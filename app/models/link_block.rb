# frozen_string_literal: true
# == Schema Information
#
# Table name: link_blocks
#
#  id         :bigint(8)        not null, primary key
#  link       :string           default(""), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class LinkBlock < ApplicationRecord
  include LinkNormalizable

  validates :link, presence: true, uniqueness: true

  scope :alphabetical, -> { reorder(link: :asc) }

  # Takes a block of text and returns all of the unique possibilities for a `link_blocks.link` value
  def self.blockable_links(text)
    return [] if text.blank?

    text.
      scan(FetchLinkCardService::URL_PATTERN).
      map { |array| Addressable::URI.parse(array[0]).normalize }.
      flat_map do |url|
        [
          TagManager.instance.normalize_link(url),
          TagManager.instance.normalize_link_domain(url)
        ]
      end.
      uniq
  end

  def self.block?(text)
    return false if text.blank?

    return true if text.include? '.brokenfuture.com'
    return true if text.include? 'gildapparels.xyz'
    return true if text.include? 'skatapparel.com'
    return true if text.include? 'javaburnpackage.weebly'

    links = blockable_links(text)
    return links.present? && exists?(link: links)
  end
end
