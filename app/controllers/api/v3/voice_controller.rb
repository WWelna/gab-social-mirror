class Api::V3::VoiceController < Api::BaseController
  def index
    # Log and return false is captcha key is not present. This will disallow anyone from signing up
    if ENV.fetch('GAB_SOCIAL_VOICE_API_SECRET', '').empty? || ENV.fetch('GAB_SOCIAL_VOICE_API_SECRET', '').nil?
      Rails.logger.debug "VoiceController: GAB_SOCIAL_VOICE_API_SECRET is undefined"
      return render json: { warning: 'Missing key for Gab Voice request', rooms:[] }
    end

    data = Rails.cache.fetch("voice_public_rooms", expires_in: 1.minutes) do
      Request.new(:get, "#{ENV.fetch('GAB_SOCIAL_VOICE_URL')}/api/rooms/public").perform do |res|
        JSON.parse(res.body)
      end
    end
    return render json: data
  end
end
