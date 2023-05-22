# frozen_string_literal: true

require 'singleton'

class TagManager
  include Singleton
  include RoutingHelper

  def web_domain?(domain)
    domain.nil? || domain.gsub(/[\/]/, '').casecmp?(Rails.configuration.x.web_domain)
  end

  def local_domain?(domain)
    domain.nil? || domain.gsub(/[\/]/, '').casecmp?(Rails.configuration.x.local_domain)
  end

  def normalize_domain(domain)
    return if domain.nil?

    uri = Addressable::URI.new
    uri.host = domain.gsub(/[\/]/, '')
    uri.normalized_host
  end

  def normalize_link(link)
    return if link.nil?
    uri = Addressable::URI.parse(link)
    return "#{uri.domain}#{uri.normalized_path}".chomp('/')
  end

  def normalize_link_domain(link)
    return if link.nil?
    uri = Addressable::URI.parse(link)
    return uri.domain
  end

  def same_acct?(canonical, needle)
    return true if canonical.casecmp?(needle)
    username, domain = needle.split('@')
    local_domain?(domain) && canonical.casecmp?(username)
  end

  def local_url?(url)
    uri    = Addressable::URI.parse(url).normalize
    domain = uri.host + (uri.port ? ":#{uri.port}" : '')
    TagManager.instance.web_domain?(domain)
  end

  def url_for(target)
    return nil if target.nil?
    return target.url if target.respond_to?(:local?) && !target.local?

    case target.object_type
    when :person
      short_account_with_replies_url(target)
    when :note, :comment, :activity
      short_account_status_url(target.account, target)
    when :sourced_comment
      # : todo :
      'todo'
    end
  end
end
