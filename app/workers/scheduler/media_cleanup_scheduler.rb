# frozen_string_literal: true

class Scheduler::MediaCleanupScheduler
  include Sidekiq::Worker

  sidekiq_options retry: 0

  def perform
    unattached_media.find_each(&:destroy)
  end

  private

  def unattached_media
    to_remove = []
    MediaAttachment.reorder(nil).unattached.where('media_attachments.created_at < ?', 1.days.ago).pluck(:id).each do |media|
      found = GroupModerationStatus.where("content @> ?", '{"media_ids":["' + "#{media}" + '"]}').exists?
      to_remove << media unless found
    end
    MediaAttachment.reorder(nil).where(id: to_remove)
  end
end
