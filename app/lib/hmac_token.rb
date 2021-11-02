# frozen_string_literal: true

require 'openssl'

class HmacToken
  TTL = 1.hour
  PREFIX = 'hmac-salt'

  Invalid = Class.new(StandardError)

  attr_reader :salt, :ttl

  def self.salt_for(id)
    Redis.current.with do |conn|
      conn.get(redis_key(id))
    end
  end

  def self.generate!(id:)
    create!(
      id: id,
      salt: OpenSSL::Digest.hexdigest('SHA256', SecureRandom.uuid)
    )
  end

  def self.create!(**atts)
    new(**atts).save!
  end

  def self.redis_key(id)
    "#{PREFIX}:#{id}"
  end

  def initialize(id:, salt:)
    @id = id
    @salt = salt
    @ttl = TTL
  end

  def save!
    raise(Invalid) unless [@id, @salt, @ttl].all?(&:present?)

    Redis.current.with do |conn|
      conn.set(redis_key, @salt, px: @ttl.in_milliseconds)
    end

    return(self)
  end

private
  def redis_key
    self.class.redis_key(@id)
  end

end
