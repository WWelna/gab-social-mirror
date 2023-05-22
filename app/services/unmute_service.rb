# frozen_string_literal: true

class UnmuteService < BaseService
  def call(account, target_account)
    return unless account.muting?(target_account)

    unmute = account.unmute!(target_account)

    # publish all unmute events to altstream
    Redis.current.publish("altstream:main", Oj.dump(event: :unmute, payload: { account_id: account.id.to_s, target_account_id: target_account.id.to_s }))

    unmute
  end
end
