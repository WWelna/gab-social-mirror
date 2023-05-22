# frozen_string_literal: true

class Api::V1::Groups::AccountBadgesController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_group
  before_action :set_badge, only: [:show, :update, :destroy, :assign_badge]
  before_action :set_group_account, only: [:assign_badge, :unassign_badge]

  def index
    badges = @group.group_account_badges
    render json: badges, each_serializer: REST::GroupAccountBadgeSerializer
  end

  def create
    authorize @group, :allow_if_is_group_admin_or_moderator?

    badge = @group.group_account_badges.create!(badge_params)
    render json: badge, serializer: REST::GroupAccountBadgeSerializer
  end

  def show
    render json: @badge, serializer: REST::GroupAccountBadgeSerializer
  end

  def update
    authorize @group, :allow_if_is_group_admin_or_moderator?

    if @badge
      @badge.update!(badge_params)
      render json: @badge, serializer: REST::GroupAccountBadgeSerializer
    else 
      return render json: { error: 'Invalid badge id' }, status: 404
    end
  end

  def destroy
    authorize @group, :allow_if_is_group_admin_or_moderator?

    if @badge
      @badge.destroy!
      render_empty_success
    else 
      return render json: { error: 'Invalid badge id' }, status: 404
    end
  end

  def assign_badge
    authorize @group, :allow_if_is_group_admin_or_moderator?
    return render json: { error: 'Invalid account' }, status: 404 if @group_account.nil? 
    return render json: { error: 'Invalid badge' }, status: 404 if @badge.nil? 

    @group_account.update!(group_account_badge_id: @badge.id)
    render json: @group_account, serializer: REST::GroupAccountSerializer
  end

  def unassign_badge
    authorize @group, :allow_if_is_group_admin_or_moderator?
    return render json: { error: 'Invalid account' }, status: 404 if @group_account.nil? 

    @group_account.update!(group_account_badge_id: nil)
    render json: @group_account, serializer: REST::GroupAccountSerializer
  end

  private

  def set_badge
    @badge = @group.group_account_badges.find(params[:id])
  end

  def set_group
    @group = Group.find(params[:group_id])
  end

  def set_group_account
    @group_account = @group.group_accounts.where(account_id: params[:account_id]).first
  end

  def badge_params
    params.permit(:name, :color, :icon, :description)
  end

end
