# frozen_string_literal: true

class InstancePresenter
  delegate(
    :site_contact_email,
    :site_title,
    :site_short_description,
    :site_description,
    to: Setting
  )

  def sample_accounts
    Rails.cache.fetch('sample_accounts', expires_in: 12.hours) { Account.discoverable.popular.limit(3) }
  end

  def version_number
    GabSocial::Version
  end

  def source_url
    GabSocial::Version.source_url
  end

  def thumbnail
    @thumbnail ||= Rails.cache.fetch('site_uploads/thumbnail') { SiteUpload.find_by(var: 'thumbnail') }
  end
  
end
