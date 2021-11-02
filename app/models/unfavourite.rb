# frozen_string_literal: true
# == Schema Information
#
# Table name: unfavourites
#
#  id         :bigint(8)        not null, primary key
#  account_id :bigint(8)
#  status_id  :bigint(8)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Unfavourite < ApplicationRecord
  include Paginable

  belongs_to :account, inverse_of: :unfavourites
  belongs_to :status,  inverse_of: :unfavourites

  validates_with UnfavouriteLimitValidator, on: :create

  before_validation do
    self.status = status.reblog if status&.reblog?
  end

end
