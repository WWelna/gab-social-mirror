# frozen_string_literal: true

class AccountAsset
  include RoutingHelper

  def initialize(account)
    @account = account
  end

  def avatar_url(width: nil)
    if @account.avatar_file_name.nil? and @account.avatar_remote_url and @account.avatar_remote_url.start_with? "gab://avatar/"
      return @account.avatar_remote_url.sub("gab://avatar/", "https://gab.com/media/user/")
    end

    full_asset_url(@account.avatar_original_url, **options(width: width))
  end

  def avatar_static_url(width: nil)
    if @account.avatar_file_name.nil? and @account.avatar_remote_url and @account.avatar_remote_url.start_with? "gab://avatar/"
      return @account.avatar_remote_url.sub("gab://avatar/", "https://gab.com/media/user/")
    end

    full_asset_url(@account.avatar_static_url, **options(width: width))
  end

  def header_url
    if @account.header_file_name.nil? and @account.header_remote_url and @account.header_remote_url.start_with? "gab://header/"
      return @account.header_remote_url.sub("gab://header/", "https://gab.com/media/user/")
    end

    full_asset_url(@account.header_original_url)
  end

  def header_static_url
    if @account.header_file_name.nil? and @account.header_remote_url and @account.header_remote_url.start_with? "gab://header/"
      return @account.header_remote_url.sub("gab://header/", "https://gab.com/media/user/")
    end

    full_asset_url(@account.header_static_url)
  end

private
  def options(width:)
    width ? { cloudflare_options: { width: width, fit: 'scale-down' } } : {}
  end

end
