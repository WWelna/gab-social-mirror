# frozen_string_literal: true

class Api::V1::ListRelationshipsController < Api::BaseController
  before_action :require_user!

  def relationships
    lists = List.where(id: list_ids)

    if lists.empty?
      render json: { error: true }, status: 503
    end
    
    @lists = lists

    render json: @lists,
           each_serializer: REST::ListRelationshipSerializer,
           relationships: ListRelationshipsPresenter.new(list_ids, current_account.id)
  end

  private

  def list_ids
    the_take = 100 #just individual results for now, maybe do mass in the future
    params[:listIds].map(&:to_i).take(the_take)
  end
end
