# frozen_string_literal: true

class Api::V1::Groups::StatusContextsController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_group
  before_action :set_status_context, only: [:show, :update, :destroy]

  def index
    status_contexts = StatusContext.owned_by_group.where(owner_id: @group.id)
    render json: status_contexts, each_serializer: REST::StatusContextSerializer
  end

  def create
    authorize @group, :allow_if_is_group_admin_or_moderator?

    data = status_context_params.merge(
      owner_id: @group.id,
      owner_type: :group,
    )
    status_context = StatusContext.create!(data)
    render json: status_context, serializer: REST::StatusContextSerializer
  end

  def show
    render json: @status_context, serializer: REST::StatusContextSerializer
  end

  def update
    authorize @group, :allow_if_is_group_admin_or_moderator?

    if @status_context
      @status_context.update!(status_context_params)
      render json: @status_context, serializer: REST::StatusContextSerializer
    else 
      return render json: { error: 'Invalid status context id' }, status: 404
    end
  end

  def destroy
    authorize @group, :allow_if_is_group_admin_or_moderator?

    # : todo :
    # ensure group associated status_status_contexts rows also gets deleted

    if @status_context
      @status_context.destroy!
      render_empty_success
    else 
      return render json: { error: 'Invalid status context id' }, status: 404
    end
  end

  private

  def set_status_context
    @status_context = StatusContext.owned_by_group.where(owner_id: @group.id).find(params[:id])
  end

  def set_group
    @group = Group.find(params[:group_id])
  end

  def status_context_params
    params.permit(:name, :index, :is_enabled)
  end

end
