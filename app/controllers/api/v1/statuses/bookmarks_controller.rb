# frozen_string_literal: true

class Api::V1::Statuses::BookmarksController < Api::BaseController
  include Authorization

  before_action -> { doorkeeper_authorize! :write, :'write:bookmarks' }
  before_action :require_user!

  def create
    @status = bookmarked_status
    render json: @status, serializer: REST::StatusBookmarkedSerializer
  end

  def show
    @status = requested_status
    render json: @status, serializer: REST::StatusBookmarkedSerializer 
  end

  def destroy
    @status = requested_status
    @bookmarks_map = { @status.id => false }

    bookmark = StatusBookmark.find_by!(account: current_user.account, status: @status)
    bookmark.destroy!

    render json: @status, serializer: REST::StatusBookmarkedSerializer
  end

  private

  def bookmarked_status
    authorize_with current_user.account, requested_status, :show?

    bci = resource_params[:bookmarkCollectionId]
    if bci == "saved" 
      bci = nil
    end

    bookmark = StatusBookmark.find_or_create_by!(
      account: current_user.account,
      status: requested_status,
      status_bookmark_collection_id: (bci.present? && !bci.nil?) ? bci : nil
    )

    bookmark.status.reload
  end

  def requested_status
    Status.find(params[:status_id])
  end

  def resource_params
    params.permit(:bookmarkCollectionId)
  end
end