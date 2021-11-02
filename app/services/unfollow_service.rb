# frozen_string_literal: true

class UnfollowService < BaseService
  # Unfollow and notify the remote user
  # @param [Account] source_account Where to unfollow from
  # @param [Account] target_account Which to unfollow
  def call(source_account, target_account)
    @source_account = source_account
    @target_account = target_account

    unfollow! || undo_follow_request!
  end

  private

  def unfollow!
    follow = Follow.find_by(account: @source_account, target_account: @target_account)

    return unless follow

    # attempt to unfollow, responds to validator
    unfollow = Unfollow.create!(account: @source_account, target_account: @target_account)
    raise ActiveRecord::RecordInvalid unless unfollow.valid?

    follow.destroy!
    follow
  end

  def undo_follow_request!
    follow_request = FollowRequest.find_by(account: @source_account, target_account: @target_account)

    return unless follow_request

    follow_request.destroy!
    follow_request
  end

end
