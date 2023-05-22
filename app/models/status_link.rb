# frozen_string_literal: true
# == Schema Information
#
# Table name: status_links
#
#  id         :bigint(8)        not null, primary key
#  url        :string
#  status_id  :bigint(8)        not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class StatusLink < ApplicationRecord
  belongs_to :status
  validates_presence_of :url
end
