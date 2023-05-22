# frozen_string_literal: true

class SunspotSyncWorker
  include Sidekiq::Worker

  def perform(model_name, id)
    if record = model_name.constantize.find_by(id: id)
      Sunspot.index(record)
    else
      Sunspot.remove_by_id(model_name, id)
    end
  end

end
