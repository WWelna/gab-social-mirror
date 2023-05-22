# frozen_string_literal: true

class FollowService < BaseService
  include Redisable

  # Follow a remote user, notify remote user about the follow
  # @param [Account] source_account From which to follow
  # @param [String, Account] uri User URI to follow in the form of username@domain (or account record)
  # @param [true, false, nil] reblogs Whether or not to show reblogs, defaults to true
  def call(source_account, target_account, reblogs: nil)
    reblogs = true if reblogs.nil?

    raise ActiveRecord::RecordNotFound if target_account.nil? || target_account.id == source_account.id || target_account.suspended?
    verify_permitted!(source_account, target_account)

    if source_account.following?(target_account)
      # We're already following this account, but we'll call follow! again to
      # make sure the reblogs status is set correctly.
      source_account.follow!(target_account, reblogs: reblogs)
      return
    elsif source_account.requested?(target_account)
      # This isn't managed by a method in AccountInteractions, so we modify it
      # ourselves if necessary.
      req = source_account.follow_requests.find_by(target_account: target_account)
      req.update!(show_reblogs: reblogs)
      return
    end

    # ActivityTracker.increment('activity:interactions')

    if target_account.locked?
      request_follow(source_account, target_account, reblogs: reblogs)
    elsif target_account.local?
      direct_follow(source_account, target_account, reblogs: reblogs)
    end
  end

  private

  def verify_permitted!(source_account, target_account)
    error_suffix = if target_account.blocking?(source_account)
      'they block you'
    elsif source_account.blocking?(target_account)
      'you block them'
    elsif target_account.moved?
      "they have moved their account to @#{target_account.moved_to_account.username}"
    end

    return true unless error_suffix
    error_prefix = "Cannot follow @#{target_account.username} because"

    raise GabSocial::NotPermittedError, "#{error_prefix} #{error_suffix}"
  end

  def request_follow(source_account, target_account, reblogs: true)
    follow_request = FollowRequest.create!(account: source_account, target_account: target_account, show_reblogs: reblogs)

    if target_account.local?
      LocalNotificationWorker.perform_async(target_account.id, follow_request.id, follow_request.class.name)
    end

    follow_request
  end

  def direct_follow(source_account, target_account, reblogs: true)
    follow = source_account.follow!(target_account, reblogs: reblogs)

    # publish all follow events to altstream
    Redis.current.publish("altstream:main", Oj.dump(event: :follow, payload: { account_id: source_account.id.to_s, target_account_id: target_account.id.to_s }))

    if target_account.local?
      LocalNotificationWorker.perform_async(target_account.id, follow.id, follow.class.name)
    end

    follow
  end

end
