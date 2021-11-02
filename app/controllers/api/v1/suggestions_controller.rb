# frozen_string_literal: true

class Api::V1::SuggestionsController < Api::BaseController
  include Authorization

  before_action -> { doorkeeper_authorize! :read }
  before_action :require_user!

  def index
    type = params[:type]

    if type == 'related'
      count = truthy_param?(:unlimited) ? PotentialFriendshipTracker::MAX_ITEMS : 10
      @accounts = PotentialFriendshipTracker.get(current_account.id, limit: count)
      render json: @accounts, each_serializer: REST::AccountSerializer
    elsif type == 'verified'
      @accounts = VerifiedSuggestions.get(current_account.id)
      render json: @accounts, each_serializer: REST::AccountSerializer
    else
      raise GabSocial::NotPermittedError, %Q|Unknown Type "#{type}"|
    end
  end

  def destroy
    PotentialFriendshipTracker.remove(current_account.id, params[:id])
    render_empty_success
  end

end
