# frozen_string_literal: true

class Api::V1::ListsController < Api::BaseController
  include Authorization

  before_action :require_user!, except: [:show]

  def index
    own = List.alphabetical.where(account: current_account).all.map do |s|
      REST::ListSerializer.new(s)
    end

    member_of = List.public_only.is_member(current_account.id).all.map do |s|
      REST::ListSerializer.new(s)
    end

    subscribed_to = List.public_only.is_subscriber(current_account.id).all.map do |s|
      REST::ListSerializer.new(s)
    end

    render json: {
      own: own,
      member_of: member_of,
      subscribed_to: subscribed_to
    }
  end

  def show
    list = nil

    if !current_account.nil?
      list = List.where(account: current_account).or(List.public_only).find(params[:id])
    else
      list = List.public_only.find(params[:id])
    end

    authorize list, :show?

    render json: list, serializer: REST::ListSerializer
  end

  def create
    @list = List.create!(list_params.merge(account: current_account))
    render json: @list, serializer: REST::ListSerializer
  end

  def update
    # check if is staff and pro and allow slug param if present
    if params[:slug].present? && !current_account.user&.staff?
      raise GabSocial::NotPermittedError, 'Unable to create list. Invalid parameters.'
    end
    
    list = List.where(account: current_account).find(params[:id])
    authorize list, :update?
    list.update!(list_params)

    if list.visibility === :private && list.subscribers > 0
      # visibility changed to private? unsubscribe everyone
      list.list_subscribers.destroy_all
    end

    render json: list, serializer: REST::ListSerializer
  end

  def destroy
    list = List.where(account: current_account).find(params[:id])
    authorize list, :destroy?
    list.destroy!
    render_empty_success
  end

  private

  def list_params
    params.permit(:title, :visibility, :slug)
  end
end
