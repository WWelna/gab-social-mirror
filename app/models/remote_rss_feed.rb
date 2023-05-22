# frozen_string_literal: true
# == Schema Information
#
# Table name: remote_rss_feeds
#
#  id              :bigint(8)        not null, primary key
#  url             :string
#  active          :boolean          default(FALSE), not null
#  last_scan_at    :datetime
#  last_trigger_at :datetime
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  fail_count      :integer          default(0), not null
#  top_guid        :text
#

class RemoteRssFeed < ApplicationRecord
  validates_presence_of :url
end
