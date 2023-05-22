# frozen_string_literal: true

class Scheduler::PreviewCardCleanupScheduler
  include Sidekiq::Worker

  sidekiq_options retry: 0

  def perform
    # link_blocked_preview_cards.find_each(&:destroy)
  end

  private

  def link_blocked_preview_cards
    # PreviewCard.reorder(nil)
    #   .unattached
    #   .where('created_at < ?', 1.day.ago)
  end
end
