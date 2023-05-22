# frozen_string_literal: true

class Api::V1::MediaController < Api::BaseController
  before_action -> { doorkeeper_authorize! :write, :'write:media' }
  before_action :require_user!

  # Do the image resizing and save to the user's attachments.
  # Error messages are available to view:
  # https://github.com/thoughtbot/paperclip/blob/main/lib/paperclip/errors.rb
  def create
    @media = current_account
      .media_attachments
      .create!(
        account: current_account,
        file: media_params[:file],
        description: media_params[:description],
        focus: media_params[:focus]
      )
    render json: @media, serializer: REST::MediaAttachmentSerializer
  rescue Paperclip::Errors::StorageMethodNotFound => err
    Rails.logger.error "Paperclip::Errors::StorageMethodNotFound: #{err}"
    # can't find minio?
    render json: { error: 'storage error' }, status: 500
  rescue Paperclip::Errors::CommandNotFoundError => err
    # couldn't find imagemagick or ffmpeg
    Rails.logger.error "Paperclip::Errors::CommandNotFoundError: #{err}"
    render json: { error: 'command error' }, status: 500
  rescue Paperclip::Errors::MissingRequiredValidatorError => err
    #  content_type or file name problem
    Rails.logger.error "Paperclip::Errors::MissingRequiredValidatorError: #{err}"
    render json: { error: 'content type or file name error' }, status: 422
  rescue Paperclip::Errors::NotIdentifiedByImageMagickError => err
    # ImageMagic cannot determine the uploaded file's metadata, usually this
    # would mean the file is not an image.
    Rails.logger.error "Paperclip::Errors::NotIdentifiedByImageMagickError: #{err}"
    render json: { error: 'metadata error' }, status: 422
  rescue Paperclip::Errors::InfiniteInterpolationError => err
    # interpolation is creating an infinite loop
    Rails.logger.error "Paperclip::Errors::InfiniteInterpolationError: #{err}"
    render json: { error: 'interpolation error' }, status: 500
  rescue Paperclip::Error => err
    Rails.logger.error "Paperclip::Error: #{err}"
    render json: { error: 'server error 1' }, status: 500
  rescue => err
    Rails.logger.error "media attach other error: #{err}"
    Rails.logger.error "err.class: #{err.class}"
    Rails.logger.error "err.to_json: #{err.to_json}"
    if err.to_s.include?('Validation failed')
      return render json: { error: 'format error' }, status: 400
    end
    render json: { error: 'server error 2' }, status: 500
  end

  def update
    @media = current_account.media_attachments.find_by(id: params[:id])
    @media.update!(media_params)
    render json: @media, serializer: REST::MediaAttachmentSerializer
  end

  private

  def media_params
    params.permit(:file, :description, :focus)
  end
end
