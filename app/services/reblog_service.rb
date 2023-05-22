# frozen_string_literal: true

class ReblogService < BaseService
  include Authorization

  # Reblog a status and notify its remote author
  # @param [Account] account Account to reblog from
  # @param [Status] reblogged_status Status to be reblogged
  # @param [Hash] options
  # @return [Status]
  def call(account, reblogged_status, options = {})
    reblogged_status = reblogged_status.reblog if reblogged_status.reblog?

    authorize_with account, reblogged_status, :reblog?

    reblog = nil
    reblog = account.statuses.find_by(reblog: reblogged_status)

    return reblog unless reblog.nil?

    @account = account
    @target_account = reblogged_status.account
    validate_blocked!

    visibility = options[:visibility] || account.user&.setting_default_privacy
    visibility = reblogged_status.visibility if reblogged_status.hidden?
    text = options[:status] || ''
    reblog = account.statuses.create!(reblog: reblogged_status, text: text, visibility: visibility)

    # DistributionWorker.perform_async(reblog.id)

    create_notification(reblog)
    bump_potential_friendship(account, reblog)

    # Publish a post status event to altstream
    payload = InlineRenderer.render(reblog, nil, :status)
    Redis.current.publish("altstream:main", Oj.dump(event: :post_status, payload: payload))

    reblog
  end

  private

  def validate_blocked!
    if @account.blocking?(@target_account)
      raise GabSocial::NotPermittedError, "You are blocking @#{@target_account.username} and are trying to repost their post."
    elsif @target_account.blocking?(@account)
      raise GabSocial::NotPermittedError, "@#{@target_account.username} has you blocked and you are trying to repost their post."
    end
  end

  def create_notification(reblog)
    reblogged_status = reblog.reblog

    if reblogged_status.account.local?
      LocalNotificationWorker.perform_async(reblogged_status.account_id, reblog.id, reblog.class.name)
    end
  end

  def bump_potential_friendship(account, reblog)
    # ActivityTracker.increment('activity:interactions')
    return if account.following?(reblog.reblog.account_id)
    PotentialFriendshipTracker.record(account.id, reblog.reblog.account_id, :reblog)
  end

end
