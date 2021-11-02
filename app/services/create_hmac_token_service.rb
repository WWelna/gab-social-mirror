# frozen_string_literal: true

require 'openssl'

class CreateHmacTokenService < BaseService

  def call(application_id:, secret:, artifact:, token_hmac:)
    @secret = secret
    @artifact = artifact
    @token_hmac = token_hmac

    verify_params!
    return(HmacToken.generate!(id: application_id))
  rescue HmacToken::Invalid
    raise GabSocial::InvalidTokenHmac
  end

private
  def verify_params!
    raise GabSocial::InvalidTokenHmac unless [@secret, @artifact, @token_hmac].all?(&:present?)

    digest = OpenSSL::HMAC.hexdigest('SHA256', @secret, @artifact)

    return(true) if ActiveSupport::SecurityUtils.secure_compare(digest, @token_hmac)
    raise GabSocial::InvalidTokenHmac
  end

end
