# frozen_string_literal: true

class Api::V1::Timelines::ExploreController < Api::BaseController
  before_action :set_sort_type
  before_action :set_statuses

  def show
    if current_user
      render json: @statuses,
            each_serializer: REST::StatusSerializer,
            relationships: StatusRelationshipsPresenter.new(@statuses, current_user.account_id)
    else
      render json: @statuses, each_serializer: REST::StatusSerializer
    end
  end

  private

  def set_sort_type
    @sort_type = 'hot'
    @sort_type = params[:sort_by] if [
      'hot',
      'top_today',
      'top_weekly',
      'top_monthly',
      'top_yearly',
      'top_all_time',
    ].include? params[:sort_by]

    return @sort_type
  end

  def set_statuses
    @statuses = ActiveRecord::Base.connected_to(role: :reading) do
      cache_collection explore_statuses, Status
    end
  end

  def explore_statuses
    page = if current_account
      params[:page].to_i
    else
      [params[:page].to_i.abs, MIN_UNAUTHENTICATED_PAGES].min
    end

    statuses = SortingQueryBuilder.new.deduped_with_cache(@sort_type, nil, page, "explore")

    if current_account
      statuses = statuses.reject {|status| FeedManager.instance.filter?(:home, status, current_account.id) }
    end

    statuses
  end
end
