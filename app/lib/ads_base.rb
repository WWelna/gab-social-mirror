# frozen_string_literal: true

class AdsBase
  class << self
    include Redisable

    def ad_click(ad_id)
      key = ["ads:clicks", ad_id.to_s].join(':')

      redis.with do |conn|
        conn.incrby(key, 1) # Auto set to 1 if key doesn't exist
      end
    end

    def ad_views(ad_id)
      key = ["ads:views", ad_id.to_s].join(':')

      redis.with do |conn|
        conn.incrby(key, 1) # Auto set to views count if key doesn't exist
      end
    end

    def retrieve_ad_clicks(ad_id)
      key = ["ads:clicks", ad_id.to_s].join(':')

      redis.with do |conn|
        @clicks  = conn.get(key) || 0
      end
      @clicks
    end

    def retrieve_ad_views(ad_id)
      key = ["ads:views", ad_id.to_s].join(':')

      redis.with do |conn|
        @views  = conn.get(key) || 0
      end
      @views
    end

    def set_current_ads(ads)
      key = "ads:current"

      redis.with do |conn|
        conn.set(key, ads.to_json)
      end
    end

    def get_current_ads
      key = "ads:current"

      redis.with do |conn|
        @ads = conn.get(key) || "[]"
      end
      JSON.parse(@ads)
    end

    def set_test_ads
      ads = [
              { id: '1',
                title: 'ad title 1',
                subtitle: 'ad subtitle 1',
                image: 'https://media.gab.com/system/media_attachments/files/078/443/343/small/ba76a34ccacc31e2.jpeg',
                url: 'https://www.gab.com',
                base_url: "GAB.com",
                user_name: "Gab",
                user_image: 'https://media.gab.com/system/media_attachments/files/082/595/171/original/d3b853a7859f9227.jpeg',
                placement: 'status'
              },
              { id: '2',
                title: 'ad title 2',
                subtitle: 'ad subtitle 2',
                image: 'https://media.gab.com/system/media_attachments/files/082/595/171/original/d3b853a7859f9227.jpeg',
                url: 'https://www.gab.com',
                placement: 'banner'
              },
              { id: '3',
                title: 'ad title 3',
                subtitle: 'ad subtitle 3',
                image: 'https://media.gab.com/system/media_attachments/files/082/595/171/original/d3b853a7859f9227.jpeg',
                url: 'https://www.gab.com',
                placement: 'panel'
              }
            ]
      set_current_ads(ads)
    end
  end
end
