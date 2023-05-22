# frozen_string_literal: true

class DoorkeeperTokenCache

  EXPIRATION = 1.hour
  PREFIX = 'dk:token'

  attr_reader :token

  def self.clear!
    Rails.cache.delete_matched("#{PREFIX}/*")
  end

  def self.delete(token)
    new(token).delete
  end

  def self.write(token, doorkeeper_token)
    new(token).write(doorkeeper_token)
  end

  def self.fetch(token, &block)
    new(token).fetch(&block)
  end

  def initialize(token)
    @token = token
  end

  def delete
    Rails.cache.delete(doorkeeper_token_key)
  end

  def write(doorkeeper_token)
    preload(doorkeeper_token)
    Rails.cache.write(doorkeeper_token_key, doorkeeper_token, expires_in: EXPIRATION)
  end

  def fetch
    Rails.cache.fetch(doorkeeper_token_key, expires_in: EXPIRATION, skip_nil: true) do
      yield.tap do |doorkeeper_token|
        preload(doorkeeper_token)
      end
    end
  end

private

  def doorkeeper_token_key
    [PREFIX, token]
  end

  def preload(doorkeeper_token)
    return unless doorkeeper_token

    # Load the application so that it's included in the cache.
    # This will prevent a Doorkeeper::Application load query every single request.
    doorkeeper_token.application
  end

end
