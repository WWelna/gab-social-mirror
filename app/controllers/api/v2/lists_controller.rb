# frozen_string_literal: true

class Api::V2::ListsController < Api::BaseController
  include Authorization

  def index
    lists = []
    type = params[:type]
    
    # : todo : paginate
    if type == 'own' && !current_account.nil?
      lists = List.alphabetical.where(account: current_account).all
    elsif type == 'member_of' && !current_account.nil?
      lists = List.public_only.is_member(current_account.id).all
    elsif type == 'subscribed_to' && !current_account.nil?
      lists = List.public_only.is_subscriber(current_account.id).all
    elsif type == 'featured' || current_account.nil?
      lists = List.alphabetical.public_only.is_featured.limit(100)
    end

    render json: lists, each_serializer: REST::ListSerializer
  end

end
