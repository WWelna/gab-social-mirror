# frozen_string_literal: true

class UnblockService < BaseService
  def call(account, target_account)
    return unless account.blocking?(target_account)

    unblock = account.unblock!(target_account)

    # publish all unblock events to altstream
    Redis.current.publish("altstream:main", Oj.dump(event: :unblock, payload: { account_id: account.id.to_s, target_account_id: target_account.id.to_s }))

    unblock
  end
end
