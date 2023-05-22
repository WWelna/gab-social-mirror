# frozen_string_literal: true

class MuteService < BaseService
  def call(account, target_account, notifications: nil)
    return if account.id == target_account.id

    mute = account.mute!(target_account, notifications: notifications)

    # publish all mute events to altstream
    Redis.current.publish("altstream:main", Oj.dump(event: :mute, payload: { account_id: account.id.to_s, target_account_id: target_account.id.to_s }))

    if mute.hide_notifications?
      BlockWorker.perform_async(account.id, target_account.id)
    end

    mute
  end
end
