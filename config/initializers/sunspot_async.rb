# frozen_string_literal: true

if defined?(Sidekiq) && !Sidekiq.server?
  Sunspot::Rails::Searchable::InstanceMethods.class_eval do
    def solr_index
      SunspotSyncWorker.perform_async(self.class.name, self.id)
    end

    def solr_remove_from_index
      SunspotSyncWorker.perform_async(self.class.name, self.id)
    end
  end
end
