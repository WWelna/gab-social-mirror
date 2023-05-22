# frozen_string_literal: true

class Api::V1::TimelinePresetsController < Api::BaseController
  before_action :require_user!
  before_action :set_preset, only: [:show, :destroy]

  def index
    @presets = load_presets
    render json: @presets, each_serializer: REST::TimelinePresetSerializer
  end

  def show
    render json: @preset, serializer: REST::TimelinePresetSerializer
  end

  def create
    @preset = TimelinePreset.create!(preset_params.merge(account: current_account))
    render json: @preset, serializer: REST::TimelinePresetSerializer
  end

  def destroy
    @preset.destroy!
    render json: { error: false, id: params[:id] }
  end

  private

  def load_presets
    cache_collection all_presets, TimelinePreset
  end
  
  def all_presets
    TimelinePreset.where(account: current_account).limit(100)
  end

  def set_preset
    @preset = TimelinePreset.where(account: current_account).find(params[:id])
  end

  def preset_params
    params.permit(:timeline, :timeline_id, :name, :sort, :index, :filters)
  end
end
