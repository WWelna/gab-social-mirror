# frozen_string_literal: true

class ProcessLinksService < BaseService
  def call(status)
    urls = LinkBlock.blockable_links(status.text)
    existing_links = status.status_links.index_by(&:url)

    status.status_links = urls.map do |url|
      existing_links[url] || status.status_links.create!(url: url)
    end
  end
end
