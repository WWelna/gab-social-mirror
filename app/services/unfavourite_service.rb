# frozen_string_literal: true

class UnfavouriteService < BaseService
  def call(account, status)
    # attempt to unfavourte, responds to validator
    unfav = Unfavourite.create!(account: account, status: status)
    raise ActiveRecord::RecordInvalid unless unfav.valid?

    favourite = Favourite.find_by!(account: account, status: status)
    favourite.destroy!
    favourite
  end
end
