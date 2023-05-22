# == Schema Information
#
# Table name: timeline_presets
#
#  id          :bigint(8)        not null, primary key
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  account_id  :bigint(8)        not null
#  timeline    :string           not null
#  timeline_id :string
#  sort        :string
#  index       :integer
#  filters     :string           is an Array
#  name        :string           default(""), not null
#

class TimelinePreset < ApplicationRecord
  # timeline: home, notifications, group, groups, feed,... etc.
  # timeline_id: would be the id for the specific group or feed,... etc.
  # sort: newest, most-liked, most-disliked... etc.
  # filters: [photos-only, exclude-links, exclude videos] ,... etc.
  # name: the display name of the preset. e.g. 'Most Liked Photos', 'Verified Notifications',... etc.

  TIMELINE_TYPE_MAP = {
    account: 'account',
    group: 'group',
    groups: 'groups', # main groups timeline (plural)... combination of all joined groups
    list: 'list',
    tag: 'tag',
    home: 'home',
    explore: 'explore',
    notifications: 'notifications',
  }.freeze

  belongs_to :account

  validates_with TimelinePresetLimitValidator

end
