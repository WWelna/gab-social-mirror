# frozen_string_literal: true

class Api::V1::Groups::InsightsController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_group

  # params[:start_date]
  # params[:end_date]

  def member_growth
    authorize @group, :allow_if_is_group_admin_or_moderator?
    # : todo :
    # member growth over time:
    # [[timestamp, member_count], ...]
    
    render_empty_success
  end

  def post_engagement
    authorize @group, :allow_if_is_group_admin_or_moderator?

    # : todo :
    # 3 line chart:
    # 1. posts over time
    # 2. comments over time
    # 2. reactions over time

    render_empty_success
  end

  # The average number of times members post, comment or react on a
  # given day in the specified date range.
  def popular_days
    authorize @group, :allow_if_is_group_admin_or_moderator?

    # : todo :
    render_empty_success
  end

  # The average number of times members post, comment or react at a
  # given hour of the day in the specified date range.
  def popular_times
    authorize @group, :allow_if_is_group_admin_or_moderator?

    # : todo :
    render_empty_success
  end

  # accounts who posted, commented, reacted the most
  def top_members
    authorize @group, :allow_if_is_group_admin_or_moderator?
    
    # : todo :
    render_empty_success
  end

  # number of removed accounts per day
  def removed_members
    authorize @group, :allow_if_is_group_admin_or_moderator?

    # : todo :
    render_empty_success
  end

  private

  def set_group
    @group = Group.find(params[:group_id])
  end

end
