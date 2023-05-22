# frozen_string_literal: true
require 'net/http'
require 'uri'
require 'feedjira'

class RemoteRssFeedScanner
  include Sidekiq::Worker

  sidekiq_options lock: :until_executed, queue: 'pull', retry: 0

  def perform(id)
    if feed = RemoteRssFeed.find_by(id: id)
      puts "Scanning RSS feed: #{feed.url}"
      begin
        url = feed.url
        response = nil
        ct = 0
        while ct == 0 || (response&.is_a?(Net::HTTPRedirection) && ct < 3) do
          response = Net::HTTP.get_response(URI.parse(url))
          url = response['location']
          ct += 1
        end
        if response.code != '200'
          throw "Bad response code: #{response.code}"
        end
        feed_data = Feedjira.parse(response.body)            
        guid = get_guid(feed_data)
        top_post = feed_data.entries.first
        if feed.top_guid.nil?
            feed.update(top_guid: guid, last_scan_at: Time.now, fail_count: 0)
        elsif feed.top_guid != guid
            feed.update(top_guid: guid, last_trigger_at: Time.now, last_scan_at: Time.now, fail_count: 0)
            make_post(feed.url, top_post)
        else
            feed.update(last_scan_at: Time.now, fail_count: 0)                
        end
      rescue Exception => e
        puts "Error scanning RSS feed: #{feed.url}"
        puts e.message
        puts e.backtrace.inspect
        feed.update(fail_count: feed.fail_count + 1)
        return
      end
    end
  end

  def get_guid(feed)
    if feed.entries.count > 0
        feed.entries.first.entry_id || feed.entries.first.url
    end
  end

  def make_post(feed, post)
    target1 = "--- #{feed}" + 10.chr
    target2 = target1 + 46.chr + 46.chr + 46.chr + 10.chr
    Setting.unscoped
      .where(var: 'remote_rss_feed', thing_type: 'User', value: target1)
      .or(Setting.unscoped.where(var: 'remote_rss_feed', thing_type: 'User', value: target2))
      .each do |setting|
        user = setting.thing
      
        puts "Making post for account: #{user.account.username}"
        PostStatusService.new.call(user.account,
                                        text: "#{post.title}\n\nLink: #{post.url}",
                                        markdown: "**#{post.title}**\n\nLink: #{post.url}",
                                        sensitive: false)
    end
  end

end