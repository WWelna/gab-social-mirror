# frozen_string_literal: true

class Api::AdsController < Api::BaseController

  def click
    AdsBase.ad_click(click_params[:ad_id]) if click_params[:ad_id].present?
    render_empty_success
  end

  def view
    AdsBase.ad_views(view_params[:ad_id]) if view_params[:ad_id].present? && view_params[:views].to_i > 0
    render_empty_success
  end

  private

  def click_params
    params.permit(:ad_id)
  end

  def view_params
    params.permit(:ad_id, :views)
  end
end
