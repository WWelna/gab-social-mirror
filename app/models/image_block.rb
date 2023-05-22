# frozen_string_literal: true
# == Schema Information
#
# Table name: image_blocks
#
#  id         :bigint(8)        not null, primary key
#  md5        :string           default(""), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class ImageBlock < ApplicationRecord
    validates :md5, presence: true, uniqueness: true
end
  