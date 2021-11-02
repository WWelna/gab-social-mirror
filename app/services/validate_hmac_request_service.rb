# frozen_string_literal: true

class ValidateHmacRequestService < BaseService
  SaltNotFound = Class.new(StandardError)

  def call(id:, hmac:, url:, body: nil)
    @id = id
    @hmac = hmac
    @body = body.presence

    if url
      uri = URI.parse(url)
      @path = uri.path
      @querystring = "?#{uri.query}" if uri.query
    end

    return valid?
  end

  def valid?
    return false unless @hmac && salt
    ActiveSupport::SecurityUtils.secure_compare(@hmac, expected_hmac)
  end

private
  def salt
    @salt ||= HmacToken.salt_for(@id)
  end

  def expected_hmac
    hmac = OpenSSL::HMAC.new(salt, OpenSSL::Digest::SHA256.new)
    hmac << @path
    hmac << @querystring if @querystring
    hmac << @body if @body
    hmac.hexdigest
  end

end
