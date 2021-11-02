# frozen_string_literal: true

class Api::V1::HmacTokensController < ApplicationController
  skip_before_action :verify_authenticity_token

  rescue_from GabSocial::InvalidTokenHmac do
    log_request(:error, 'INVALID HMAC REQUEST')

    render status: 403, json: {
      audit: {
        ip: request.remote_ip,
        reason: 'Unauthorized access. Request logged.',
      }
    }
  end

  def create
    hmac_token = CreateHmacTokenService.new.call(
      application_id: doorkeeper_token&.application&.id,
      secret: doorkeeper_token&.application&.secret,
      artifact: params[:requestAuthenticationArtifact],
      token_hmac: request.headers['X-Gab-Token-Hmac']
    )

    render json: {
      salt: hmac_token.salt,
      validForMs: hmac_token.ttl.in_milliseconds,
    }
  end

end
