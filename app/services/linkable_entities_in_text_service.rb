# frozen_string_literal: true

class LinkableEntitiesInTextService < BaseService
  # from FetchLinkCardService. FetchLinkCardService::URL_PATTERN wouldn't work so..
  URL_PATTERN = %r{
    (                                                                                                 #   $1 URL
      (https?:\/\/)                                                                                   #   $2 Protocol (required)
      (#{Twitter::Regex[:valid_domain]})                                                              #   $3 Domain(s)
      (?::(#{Twitter::Regex[:valid_port_number]}))?                                                   #   $4 Port number (optional)
      (/#{Twitter::Regex[:valid_url_path]}*)?                                                         #   $5 URL Path and anchor
      (\?#{Twitter::Regex[:valid_url_query_chars]}*#{Twitter::Regex[:valid_url_query_ending_chars]})? #   $6 Query String
    )
  }iox

  def call(text)
    @text = text
    # doesn't work for localhost
    url = parse_urls

    return nil if url.nil?
    # ensure url base is host (gab.com, develop.gab.com, etc.)
    # : TESTING : comment out following line if testing localhost
    return nil if Rails.configuration.x.web_domain != url.host

    val = recognized_params(url)

    case val[:action]
    when "status_show"
      status = Status.find(val[:statusId])
      return nil if status.nil?
      # make sure the passed in username matches the status
      if status.account.username.downcase == val[:username].downcase
        return {
          status: status,
          url: url,
        }
      end
    end
    # : todo :
    # optional_search_for_type: ['status', 'account', 'group', 'feed', 'marketplace_listing']
    # i.e. return Account if text contains account url

    nil

    rescue HTTP::Error, Addressable::URI::InvalidURIError, ActiveRecord::RecordNotFound, GabSocial::HostValidationError, GabSocial::LengthValidationError => e
      # Rails.logger.debug "Error fetchin: #{e}"
      nil
  end

  private

  # from FetchLinkCardService
  def parse_urls
    urls = @text.scan(URL_PATTERN).map { |array| Addressable::URI.parse(array[0]).normalize }
    return urls.reject { |uri| bad_url?(uri) }.first
  end

  # from FetchLinkCardService
  def bad_url?(uri)
    # Avoid invalid URLs
    uri.host.blank? || !%w(http https).include?(uri.scheme)
  end

  # from StatusFinder
  def recognized_params(url)
    Rails.application.routes.recognize_path(url)
  end

end
