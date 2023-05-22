# frozen_string_literal: true

class REST::MediaAttachmentSerializer < ActiveModel::Serializer
  include RoutingHelper

  attributes :id, :type, :url, :preview_url, :source_mp4,
             :remote_url, :meta, :account_id,
             :status_id, :marketplace_listing_id,
             :description, :blurhash, :file_content_type

  def id
    object.id.to_s
  end

  def account_id
    object.account_id.to_s if !object.account_id.nil?
  end

  def status_id
    object.status_id.to_s if !object.status_id.nil?
  end
  
  def marketplace_listing_id
    object.marketplace_listing_id.to_s if !object.marketplace_listing_id.nil?
  end

  def clean_migrated_url
    object
      .file_file_name
      .sub("gab://media/", "")
      .gsub("https://gabfiles.blob.core.windows.net/", "https://gab.com/media/")
      .gsub("https://files.gab.com/file/files-gab/", "https://gab.com/media/")
      .gsub("https://f002.backblazeb2.com/file/files-gab/", "https://gab.com/media/")
      .split("|")
  end

  def url
    if object.type == "video"
      return nil
    end

    if object.file_file_name and object.file_file_name.start_with? "gab://media/"
      return clean_migrated_url[1]
    end

    full_asset_url(object.file.url(:original))
  end

  def source_mp4
    if object.type == "image" || object.type == "gifv" || object.type == "unknown"
      return nil
    else 
      full_asset_url(object.file.url(:playable))
    end
  end

  def remote_url
    object.remote_url.presence
  end

  def preview_url
    if object.file_file_name and object.file_file_name.start_with? "gab://media/"
      return clean_migrated_url[0]
    end

    full_asset_url(object.file.url(:small))
  end

  def meta
    object.file.meta
  end

end
