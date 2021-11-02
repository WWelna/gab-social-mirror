# frozen_string_literal: true

class ProcessHashtagsService < BaseService
  def call(status, tags = [])
    tags = Extractor.extract_hashtags(status.text) + Extractor.extract_cashtags(status.text) if status.local?

    status.tags = tags.map { |str| str.mb_chars.downcase }.uniq(&:to_s).map do |name|
      Tag.where(name: name).first_or_create(name: name)
    end
  end
end
