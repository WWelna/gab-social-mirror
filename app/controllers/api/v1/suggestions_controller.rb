# frozen_string_literal: true

class Api::V1::SuggestionsController < Api::BaseController
  include Authorization

  before_action -> { doorkeeper_authorize! :read }
  before_action :require_user!

  def index
    type = params[:type]

    if not ['related', 'verified'].include?(type)
      raise GabSocial::NotPermittedError, %Q|Unknown Type "#{type}"|
    end

    if type == 'related'
      count = truthy_param?(:unlimited) ? PotentialFriendshipTracker::MAX_ITEMS : 10
      @accounts = PotentialFriendshipTracker.get(current_account.id, limit: count)
    elsif type == 'verified'
      @accounts = VerifiedSuggestions.get(current_account.id)
    end

    render json: @accounts.reject { |act|
      current_account.blocking?(act) ||
      act.blocking?(current_account)  ||
      current_account.following?(act) ||
      current_account.muting?(act)
    }, each_serializer: REST::AccountSerializer
  end

  def destroy
    PotentialFriendshipTracker.remove(current_account.id, params[:id])
    render_empty_success
  end

end
