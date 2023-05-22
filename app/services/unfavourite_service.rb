# frozen_string_literal: true

class UnfavouriteService < BaseService
  def call(account, status)
    favourite = Favourite.find_by!(account: account, status: status)

    # attempt to unfavourte, responds to validator
    unfav = Unfavourite.create!(account: account, status: status)
    raise ActiveRecord::RecordInvalid unless unfav.valid?

    needs_change = check_top_two_reactions(status, favourite)
    favourite.destroy!
    count_and_update_top_two_reactions(status) if needs_change

    # if the status is less than 2 hours old, reload & publish new stats to altstream
    if status.created_at > 8.hours.ago && status.in_reply_to_id.nil?
      payload = InlineRenderer.render(status.reload, nil, :status_stat)
      Redis.current.publish("altstream:main", Oj.dump(event: :status_stat, payload: payload))
    end

    favourite
  end

  private

  def check_top_two_reactions(status, favourite)
    top2 = status.status_stat.top_reactions
    if !top2.nil?
      top2 = top2.split(',')
      if top2.include?(favourite.reaction_id.to_s)
        return true
      end
    end
    false
  end

  def count_and_update_top_two_reactions(status)
    rmap = Status.reactions_map(status.id)
    top2 = rmap.sort_by { |id, count| count }.reverse
    top2 = top2[0..1].map { |id, count| id }.join(',')
    status.status_stat.update!(top_reactions: top2)
  end

end
