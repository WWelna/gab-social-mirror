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

  def self.block?(text)
    return false if text.nil?
    return false if text.length < 8

    return true if text.include? '.weebly.com'
    return true if text.include? '.brokenfuture.com'
    return true if text.include? 'gildapparels.xyz'
    return true if text.include? 'skatapparel.com'

    urls = text.scan(FetchLinkCardService::URL_PATTERN).map {|array|
      Addressable::URI.parse(array[0]).normalize
    }
    url = urls.first

    return false if url.nil?

    link_for_fetch = TagManager.instance.normalize_link(url)
    link_for_fetch = link_for_fetch.chomp("/")

    domain_for_fetch = TagManager.instance.normalize_link_domain(url)

    matching(:link, :is, link_for_fetch).
      or(matching(:link, :is, domain_for_fetch)).
      exists?
  end
end
