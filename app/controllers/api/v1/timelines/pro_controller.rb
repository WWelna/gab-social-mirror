# frozen_string_literal: true

class Api::V1::Timelines::ProController < Api::BaseController
  before_action :set_sort_type

  def show
    @statuses = load_statuses
    @statuses.reject { |status| status.proper.nil? }
    render json: @statuses, each_serializer: REST::StatusSerializer, relationships: StatusRelationshipsPresenter.new(@statuses, current_user&.account_id)
  end

  private

  def load_statuses
    ActiveRecord::Base.connected_to(role: :reading) do
      cache_collection pro_statuses, Status
    end
  end

  def pro_statuses
    statuses = Status.popular_accounts

    timeline_id = 'pro'

    if params[:media_type] == 'videos'
      timeline_id = 'pro:videos'
      statuses = statuses.joins(:media_attachments).where(media_attachments: {type: [:gifv, :video]})
    elsif params[:media_type] == 'photos'
      timeline_id = 'pro:photos'
      statuses = statuses.joins(:media_attachments).where(media_attachments: {type: [:image]})
    end

    # only show 1 page if no user
    page = if current_account
      params[:page].to_i
    else
      [params[:page].to_i.abs, MIN_UNAUTHENTICATED_PAGES].min
    end
    
    statuses = statuses.merge(SortingQueryBuilder.new.call(@sort_type, nil, page, timeline_id))

    statuses
  end

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
end
