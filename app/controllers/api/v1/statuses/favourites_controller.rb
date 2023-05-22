# frozen_string_literal: true

class Api::V1::Statuses::FavouritesController < Api::BaseController
  include Authorization

  before_action -> { doorkeeper_authorize! :write, :'write:favourites' }, only: [:create, :destroy]
  before_action :require_user!

  def create
    @status = favourited_status
    # publish updated stats to altstream for recent top level statuses
    if @status.created_at > 8.hours.ago && @status.in_reply_to_id.nil?
      payload = InlineRenderer.render(@status, nil, :status_stat)
      Redis.current.publish("altstream:main", Oj.dump(event: :status_stat, payload: payload))
    end
    render json: @status, serializer: REST::StatusStatSerializer
  end

  def reactions
    rmap = Rails.cache.fetch("reactions_counts:#{params[:status_id]}", expires_in: 4.hours) do
      Status.reactions_map(params[:status_id])
    end
    render json: rmap
  end

  def destroy
    @status = requested_status
    @favourites_map = { @status.id => false }

    UnfavouriteWorker.new.perform(current_user.account_id, @status.id)

    @status.reload

    render json: @status,
           serializer: REST::StatusStatSerializer,
           unfavourite: true,
           relationships: StatusRelationshipsPresenter.new([@status], current_user&.account_id, favourites_map: @favourites_map)
  end

  private

  def favourited_status
    service_result.status.reload
  end

  def service_result
    FavouriteService.new.call(current_user.account, requested_status, params[:reaction_id])
  end

  def requested_status
    Status.find(params[:status_id])
  end
end
