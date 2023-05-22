# frozen_string_literal: true

class Api::V1::Timelines::GroupController < Api::BaseController
  before_action :set_group
  before_action :set_sort_type
  before_action :set_statuses

  # after_action :insert_pagination_headers, unless: -> { @statuses.empty? }

  def show
    if current_user
      # for group admin or moderators do not apply blocks
      group_relationships = GroupRelationshipsPresenter.new([@group.id], current_user.account_id)
      is_admin_or_mod = group_relationships.admin[@group.id] == true or group_relationships.moderator[@group.id] == true
      is_member = group_relationships.member[@group.id] == true
      if @group.is_private and !is_admin_or_mod and !is_member
        render json: { error: 'Not authorized' }, status: :forbidden
        return
      end
      status_relationships = nil
      if not is_admin_or_mod
        # for normal users apply blocks e.g. "user blocks you"
        status_relationships = StatusRelationshipsPresenter.new(@statuses, current_user.account_id, group_id: @group.id)
      end
      render json: @statuses,
            each_serializer: REST::StatusSerializer,
            group_id: params[:id], # : todo :
            relationships: status_relationships
    else
      render json: @statuses, each_serializer: REST::StatusSerializer
    end
  end

  private

  def set_sort_type
    @sort_type = 'newest'
    @sort_type = 'top_today' if current_user.nil?
    @sort_type = params[:sort_by] if [
      'hot',
      'newest',
      'recent',
      'top_today',
      'top_weekly',
      'top_monthly',
      'top_yearly',
      'top_all_time',
    ].include? params[:sort_by]

    return @sort_type
  end

  def set_group
    @group = Group.find_by!(id: params[:id], is_archived: false)
  end

  def set_statuses
    @statuses = cached_group_statuses
    @statuses = @statuses.reject { |status| status.proper.nil? }
  end

  def cached_group_statuses
    ActiveRecord::Base.connected_to(role: :reading) do
      cache_collection group_statuses, Status
    end
  end

  def group_statuses
    if current_account
      SortingQueryBuilder.new.call(@sort_type, @group, params[:page]).reject {|status|
        FeedManager.instance.filter?(:home, status, current_account.id)
      }
    else
      page = [params[:page].to_i.abs, MIN_UNAUTHENTICATED_PAGES].min
      SortingQueryBuilder.new.call(@sort_type, @group, page)
    end

  end

  # ❕ enable these again if you figure out how to use max_id cursors

  # def insert_pagination_headers
  #   set_pagination_headers(next_path, prev_path)
  # end

  # def pagination_params(core_params)
  #   params.slice(:limit).permit(:limit).merge(core_params)
  # end

  # def next_path
  #   api_v1_timelines_group_url params[:id], pagination_params(max_id: pagination_max_id)
  # end

  # def prev_path
  #   api_v1_timelines_group_url params[:id], pagination_params(min_id: pagination_since_id)
  # end

  # def pagination_max_id
  #   @statuses.last.id
  # end

  # def pagination_since_id
  #   @statuses.first.id
  # end
end
