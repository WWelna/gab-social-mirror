# frozen_string_literal: true

class Api::V1::SuggestionsController < Api::BaseController
  include Authorization

  before_action -> { doorkeeper_authorize! :read }
  before_action :require_user!

  def index
    type = params[:type]

    if not ['related', 'verified', 'groups', 'feeds', 'tags'].include?(type)
      raise GabSocial::NotPermittedError, %Q|Unknown Type "#{type}"|
    end

    if type == 'related'
      count = truthy_param?(:unlimited) ? PotentialFriendshipTracker::MAX_ITEMS : 10
      @accounts = PotentialFriendshipTracker.get(current_account.id, limit: count)

      return render json: @accounts, each_serializer: REST::AccountSerializer
    elsif type == 'verified'
      @accounts = VerifiedSuggestions.get(current_account.id)

      return render json: @accounts, each_serializer: REST::AccountSerializer
    elsif type == 'groups'
      @groups = GroupSuggestions.get(current_account.id)
      return render json: @groups, each_serializer: REST::GroupSerializer
    elsif type == 'feeds'
      @lists = ListSuggestions.get(current_account.id)
      return render json: @lists, each_serializer: REST::ListSerializer
    elsif type == 'tags'
      @tags = TagSuggestions.get(current_account.id)
      return render json: @tags, each_serializer: REST::TagSerializer
    end

    render json:[], status: 200
  end

  def destroy
    if type == 'related'
      PotentialFriendshipTracker.remove(current_account.id, params[:id])
      render_empty_success
    elsif type == 'groups'
      GroupSuggestions.remove(current_account.id, params[:id])
      render_empty_success
    elsif type == 'feeds'
      ListSuggestions.remove(current_account.id, params[:id])
      render_empty_success
    elsif type == 'tags'
      TagSuggestions.remove(current_account.id, params[:id])
      render_empty_success
    else
      render json: { error: true }, status: 422
    end
  end

end
