# frozen_string_literal: true

class Api::V1::GroupsController < Api::BaseController
  GROUPS_PER_PAGE = 50

  include Authorization

  # before_action -> { doorkeeper_authorize! :read, :'read:groups' }, only: [:index, :show]
  before_action -> { doorkeeper_authorize! :write, :'write:groups' }, except: [:index, :show]

  before_action :require_user!, except: [:index, :show]
  before_action :set_group, except: [:index, :create, :by_category, :by_tag, :block, :unblock]
  before_action :set_group_for_block, only: [:block, :unblock]

  def index
    case current_tab
      when 'featured'
        @groupIds = FetchGroupsService.new.call("featured")
        @groups = Group.where(id: @groupIds).limit(150).includes(:group_categories)
      when 'member'
        if !current_user
          return render json: { error: 'This method requires an authenticated user' }, status: 422
        end
        @groups = Group.alphabetical.joins(:group_accounts).where(is_archived: false, group_accounts: { account: current_account }).includes(:group_categories)
      when 'admin'
        if !current_user
          render json: { error: 'This method requires an authenticated user' }, status: 422
        end
        @groups = Group.alphabetical.joins(:group_accounts).where(is_archived: false, group_accounts: { account: current_account, role: :admin }).includes(:group_categories)
    end

    render json: @groups, each_serializer: REST::GroupSerializer
  end

  def by_category
    if !current_user
      return render json: { error: 'This method requires an authenticated user' }, status: 422
    end

    page = Integer(params[:page] || 1)

    groups = if params[:category].present?
      Group.where(
        is_archived: false,
        group_categories: GroupCategories.matching(:text, :contains, params[:category])
      )
      .order(member_count: :desc).includes(:group_categories)
      .page(page)
      .per(GROUPS_PER_PAGE)
    else
      []
    end

    render json: groups, each_serializer: REST::GroupSerializer
  end

  def by_tag
    if !current_user
      return render json: { error: 'This method requires an authenticated user' }, status: 422
    end

    groups = if params[:tag].present?
      Group.where(is_archived: false).matches_array(:tags, '||', params[:tag]).order(member_count: :desc).includes(:group_categories)
    else
      []
    end

    render json: groups, each_serializer: REST::GroupSerializer
  end

  def show
    render json: @group, serializer: REST::GroupSerializer, individual_group: true
  end

  def create
    authorize :group, :create?

    @group = Group.create!(group_params.merge(account: current_account))
    render json: @group, serializer: REST::GroupSerializer
  end

  def update
    authorize @group, :update?

    @group.update!(group_params)
    render json: @group, serializer: REST::GroupSerializer
  end

  def destroy
    authorize @group, :destroy?

    @group.is_archived = true
    @group.save!
    render_empty_success
  end

  def destroy_status
    authorize @group, :destroy_status?

    begin
      status = Status.find(params[:status_id])
      GroupUnlinkStatusService.new.call(current_account, @group, status)
    rescue => e
      Rails.logger.error "Exception in groups_controller#destroy_status. #{e.class}: #{e.message}"
      # Succeed anyway
    end
    render_empty_success
  end

  def approve_status
    authorize @group, :approve_status?

    status = Status.find(params[:status_id])
    GroupApproveStatusService.new.call(current_account, @group, status)
    render_empty_success
  end

  def member_search
    authorize @group, :allow_if_is_group_admin_or_moderator?

    @accounts = Group.search_for_members(@group, params[:q].strip, DEFAULT_ACCOUNTS_LIMIT)
    render json: @accounts, each_serializer: REST::AccountSerializer
  end

  def removed_accounts_search
    authorize @group, :allow_if_is_group_admin_or_moderator?
    
    @accounts = Group.search_for_removed_accounts(@group, params[:q].strip, DEFAULT_ACCOUNTS_LIMIT)
    render json: @accounts, each_serializer: REST::AccountSerializer
  end

  def block
    blocked = BlockedGroup.where(target_group_id: @group.id, account_id: current_account.id)
    if !blocked.empty?
      return render json: { error: 'You have already muted this group.' }, status: 403
    end
    BlockedGroup.create!(target_group_id: @group.id, account_id: current_account.id)
    render_empty_success
  end

  def unblock
    blocked = BlockedGroup.where(target_group_id: @group.id, account_id: current_account.id)
    if blocked.empty?
      return render json: { error: 'You are not muting this group.' }, status: 403
    end
    blocked.first.destroy!
    render_empty_success
  end

  private

  def current_tab
    tab = 'featured'
    tab = params[:tab] if ['featured', 'member', 'admin', 'new'].include? params[:tab]
    return tab
  end

  def set_group
    @group = Group.includes(:group_categories).find_by!(id: params[:id], is_archived: false)
  end

  def set_group_for_block
    @group = Group.find_by!(id: params[:group_id], is_archived: false)
  end

  def group_params
    thep = params.permit(
      :title,
      :password,
      :cover_image,
      :description,
      :tags,
      :group_category_id,
      :slug,
      :paused_at,
      :is_visible,
      :is_private,
      :is_moderated,
      :is_members_visible,
      :is_admins_visible,
      :is_questions_enabled,
      :theme_color,
    )
    thep[:tags] = thep[:tags].split(",") unless thep[:tags].nil?
    thep[:cover_image] = nil if thep[:cover_image] == 'undefined'

    thep
  end
end
