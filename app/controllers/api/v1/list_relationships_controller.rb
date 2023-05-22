# frozen_string_literal: true

class Api::V1::ListRelationshipsController < Api::BaseController
  before_action :require_user!

  def relationships
    lists = List.public_only.where(id: list_ids).select('id')

    if lists.empty?
      render json: { error: true }, status: 503
    end
    
    @lists = lists.index_by(&:id).values_at(*list_ids).compact
    render json: @lists, each_serializer: REST::ListRelationshipSerializer, relationships: get_relationships
  end

  private

  def get_relationships
    ListRelationshipsPresenter.new(@lists, current_user.account_id)
  end

  def list_ids
    the_take = 1 #just individual results for now, maybe do mass in the future
    params[:listIds].map(&:to_i).take(the_take)
  end
end
