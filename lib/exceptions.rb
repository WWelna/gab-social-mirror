# frozen_string_literal: true

module GabSocial
  class Error < StandardError; end
  class ValidationError < Error; end
  class HostValidationError < ValidationError; end
  class LengthValidationError < ValidationError; end
  class DimensionsValidationError < ValidationError; end
  class RaceConditionError < Error; end
  class InvalidTokenHmac < Error; end

  class NotPermittedError < Error
    def initialize(msg = nil)
      msg = "Not Allowed: #{msg}" if msg
      msg ||= 'This action is not allowed'
      super(msg)
    end
  end

  class UnexpectedResponseError < Error
    def initialize(response = nil)
      if response.respond_to? :uri
        super("#{response.uri} returned code #{response.code}")
      else
        super
      end
    end
  end
end
