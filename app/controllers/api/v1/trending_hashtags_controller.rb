# frozen_string_literal: true

class Api::V1::TrendingHashtagsController < EmptyController

  def show
    tags = ""
    Redis.current.with do |conn|
      tags = conn.get("admin_trending_hashtags") || ""
    end
    
    results = []

    tags = tags.strip.split(/\s*,\s*/)

    tags.each do |tag|
      modeledTag = Tag.where(name: tag.to_s.downcase).limit(1).first

      unless modeledTag.nil?
        count = Status
          .where('created_at > ?', 7.days.ago)
          .joins(:statuses_tags)
          .where(statuses_tags: { tag_id: modeledTag.id })
          .count
      else
        count = 0
      end

      results << {
        tag: tag,
        uses: count
      }
    end

    render json: { trending_hashtags: results }
  end

end
