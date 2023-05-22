# frozen_string_literal: true

=begin

GMS=group_moderation_statuses

When a group is moderated statuses will post into GMS table instead of statuses.
The reason for posting into GMS is that we did not want to add a field into the
statuses table. The status sits there until a moderator reviews it. A moderator
can mark an account as approved and then statuses will post directly into the
statuses table again.

FYI:
+ If you see `statusId` it probably means GMS.id.
+ GMS.content are copied to statuses when approved

=end

class Api::V1::Groups::ModerationController < Api::BaseController
  include Authorization

  LIMIT = 20

  before_action -> { doorkeeper_authorize! :read, :'read:groups' }, only: [:show]
  before_action -> { doorkeeper_authorize! :write, :'write:groups' }, except: [:show]

  before_action :require_user!
  before_action :set_group
  before_action :moderator_authorized, except: [:my_stats]
  before_action :load_post, only: [
    :approve_post,
    :remove_post,
    :approve_user,
    :remove_user,
    :report_user
  ]

  around_action :wrap_in_transaction, only: [
    :approve_post,
    :remove_post,
    :approve_user,
    :remove_user,
    :report_user
  ]

  def show
    @list = load_list.limit(LIMIT)
    render json: @list, each_serializer: REST::GroupModerationStatusSerializer
  end

  def stats
    render json: { count: load_list.count }
  end

  # single post approved
  def approve_post
    GroupModerationService.approve_post({ post: @post })
  end
  
  # single post rejected
  def remove_post
    GroupModerationService.remove_post({ post: @post })
  end
  
  # user's statuses are all made visible and they're allowed to post normally
  def approve_user
    GroupModerationService.approve_user({ post: @post })
  end
  
  # user's statuses removed from the group and the user is moved out of the group
  def remove_user
    GroupModerationService.remove_user({ post: @post })
  end
  
  # user is removed from group and reported
  def report_user
    GroupModerationService.report_user({
      post: @post,
      current_account: current_account
    })
  end

  # normal user's count waiting for approval from mods
  def my_stats
    count = 0
    if current_account.created_at > 3.months.ago && !current_account.vpdi?
      count = GroupModerationStatus
        .where(group_id: @group.id)
        .where(account_id: current_account.id)
        .count
    end
    render json: { count: count }
  end

  private

  def set_group
    @group = Group.find(params[:group_id])
  end

  def load_post
    @post = GroupModerationStatus.find(params[:statusId])
    if @post.nil? || @post.group_id != @group.id
      render json: {error: "Status not found"}, status: 404
    end
  end

  def load_list
    GroupModerationStatus.unscoped.where(group_id: @group.id).order(id: :asc)
  end

  def moderator_authorized
    authorize @group, :allow_if_is_group_admin_or_moderator?
  end

  def group_moderation_params
    params.permit(:statusId, :group_id)
  end

  def wrap_in_transaction
    ApplicationRecord.transaction do
      yield
    end
  end
end
