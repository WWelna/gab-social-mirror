# frozen_string_literal: true

class UnfavouriteService < BaseService
  def call(account, status)
    favourite = Favourite.find_by!(account: account, status: status)

    # attempt to unfavourte, responds to validator
    unfav = Unfavourite.create!(account: account, status: status)
    raise ActiveRecord::RecordInvalid unless unfav.valid?

    favourite.destroy!
    clear_reaction_cache(status)
    favourite
  end

  private

  def clear_reaction_cache(status)
    Rails.cache.delete("reactions_counts:#{status.id}")
    Rails.cache.delete("statuses/#{status.id}")
  end

end
