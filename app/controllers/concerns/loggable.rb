# frozen_string_literal: true

module Loggable
  extend ActiveSupport::Concern

private
  def log_request(severity, message='VERBOSE REQUEST LOG')
    return if @__request_logged
    @__request_logged = true

    severity = Logger.const_get(severity.to_s.upcase)

    log_data = {
      controller: controller_name,
      action: action_name,
      method: request.method,
      path: request.fullpath,
      params: params,
      headers: loggable_headers,
      ip: request.remote_ip,
    }

    logger.log(severity, "[#{message}]: #{log_data.to_json}")
  rescue => e
    logger.error("[#{message} FAILED]: #{e.class} - #{e.message}")
  end

  def loggable_headers
    hdrs = {}

    request.headers.each do |key, value|
      if key.to_s.start_with?('HTTP_')
        header_key = key[5..-1]
      elsif ['CONTENT_TYPE', 'CONTENT_LENGTH'].include?(key)
        header_key = key
      else
        next
      end

      hdrs[header_key.split('_').map {|s| s.capitalize}.join('-')] = value
    end

    return hdrs
  end
end
