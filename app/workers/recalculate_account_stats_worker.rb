# frozen_string_literal: true

class RecalculateAccountStatsWorker
  include Sidekiq::Worker

  def perform(account_id)

    begin
        @accountstat = AccountStat.find_by(account_id: account_id)
        return if @accountstat.nil?
        following = Follow.where(account_id: account_id).count
        followers = Follow.where(target_account_id: account_id).count
        if (@accountstat.following_count != following) || (@accountstat.followers_count != followers)
            @accountstat.update(following_count: following, followers_count: followers)
        end

    rescue => e
        puts e.message
        true
    end

  end
end
