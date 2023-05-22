# frozen_string_literal: true

class Api::V1::Timelines::PollsController < Api::BaseController
  before_action :set_sort_type

  def show
    @statuses = load_poll_statuses
    render json: @statuses,
           each_serializer: REST::StatusSerializer,
           relationships: StatusRelationshipsPresenter.new(@statuses, current_user&.account_id)
  end

  private

  def load_poll_statuses
    poll_statuses
  end

  def poll_statuses
    statuses = Status.popular_accounts.without_replies.joins(:poll)

    if truthy_param?(:expired)
      statuses = statuses.where('polls.expires_at < ?', Time.now.utc)
    else
      # statuses = statuses.where('polls.expires_at >= ?', Time.now.utc)
    end

    # only show 1 page if no user
    page = if current_account
      params[:page].to_i
    else
      [params[:page].to_i.abs, MIN_UNAUTHENTICATED_PAGES].min
    end
  
    statuses = statuses.merge(SortingQueryBuilder.new.call(@sort_type, nil, page, 'polls'))

    if !!params[:sort_by] && params[:sort_by].start_with?('most_votes')
      statuses = statuses.where('polls.votes_count > 0')
      statuses = statuses.reorder('polls.votes_count desc')
    end

    statuses
  end

  def set_sort_type
    @sort_type = 'newest'
    @sort_type = params[:sort_by] if [
      'hot',
      'newest',
      'recent',
      'top_today',
      'top_weekly',
      'top_monthly',
      'top_yearly',
      'top_all_time',
      'most_votes_today',
      'most_votes_weekly',
      'most_votes_monthly',
      'most_votes_yearly',
      'most_votes_all_time',
    ].include? params[:sort_by]

    return @sort_type
  end


end
