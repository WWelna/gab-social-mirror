# frozen_string_literal: true

# == Schema Information
#
# Table name: status_tombstones
#
#  id           :bigint(8)        not null, primary key
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  status_id                     :bigint(8)        not null
#

class StatusTombstone < ApplicationRecord
  include Paginable

  belongs_to :status
end
