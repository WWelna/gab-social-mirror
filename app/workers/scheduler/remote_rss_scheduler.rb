# frozen_string_literal: true

class Scheduler::RemoteRssScheduler
  include Sidekiq::Worker

  sidekiq_options retry: 0

  def perform

    remote_feeds = RemoteRssFeed.where('1 = 1').order(:id)

    target1 = "--- ''" + 10.chr
    target2 = target1 + 46.chr + 46.chr + 46.chr + 10.chr

    setting_feeds = Setting.unscoped.where(var: 'remote_rss_feed', thing_type: 'User').where.not(value: target1).where.not(value: target2).order(:id)

    new_feeds = []
    dead_feeds = []

    setting_feeds.each do |setting_feed|
        setting_feed_url = setting_feed.value
        remote_feed = remote_feeds.find { |feed| feed.url == setting_feed_url }
        if !remote_feed
            new_feeds << setting_feed_url
        end
    end

    remote_feeds.each do |remote_feed|
        setting_feed = setting_feeds.find { |feed| feed.value == remote_feed.url }
        if !setting_feed
            dead_feeds << remote_feed.url
        elsif remote_feed.fail_count > 20 && remote_feed.active == true
            puts "Marking RSS feed Inactive after 20 failures: #{remote_feed.url}"
            remote_feed.update(active: false)
        end
    end
    
    puts "New feeds: #{new_feeds}"
    puts "Dead feeds: #{dead_feeds}"

    new_feeds.each do |new_feed|
        puts "Adding RSS feed: #{new_feed}"
        RemoteRssFeed.create(url: new_feed, active: true)
    end

    dead_feeds.each do |dead_feed|
        puts "Removing RSS feed: #{dead_feed}"
        RemoteRssFeed.where(url: dead_feed).destroy_all
    end

    RemoteRssFeed.where(last_scan_at: nil).where(active: true).each do |remote_feed|
        RemoteRssFeedScanner.perform_async(remote_feed.id)
    end

    RemoteRssFeed.where('last_scan_at < ?', 10.minutes.ago).where(active: true).each do |remote_feed|
        RemoteRssFeedScanner.perform_async(remote_feed.id)
    end

  end
end
