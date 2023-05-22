# frozen_string_literal: true

module RoutingHelper
  extend ActiveSupport::Concern
  include Rails.application.routes.url_helpers
  include ActionView::Helpers::AssetTagHelper
  include Webpacker::Helper

  included do
    def default_url_options
      ActionMailer::Base.default_url_options
    end
  end

  def full_asset_url(source, **options)
    cloudflare_options = options.delete(:cloudflare_options)
    source = ActionController::Base.helpers.asset_url(source, options) unless use_storage?
    uri = URI.join(root_url, source)

    if cloudflare_options.present? && Rails.env.production?
      # https://developers.cloudflare.com/images/image-resizing/url-format
      directive = cloudflare_options.map { |k,v| "#{k}=#{v}" }.join(',')
      resize = "/cdn-cgi/image/#{directive}"
      uri.path = "#{resize}#{uri.path}"
    end

    return(uri.to_s)
  end

  def full_pack_url(source, **options)
    full_asset_url(asset_pack_path(source, options))
  end

  private

  def use_storage?
    Rails.configuration.x.use_s3 || Rails.configuration.x.use_swift
  end
end
