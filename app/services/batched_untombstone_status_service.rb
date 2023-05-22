# frozen_string_literal: true

class BatchedUntombstoneStatusService < BaseService

  def call(statuses, **options)
    statuses = Status.unscoped.where(id: statuses.map(&:id))

    statuses.each do |status|
      status.update!(tombstoned_at: nil)
      tombstone = StatusTombstone.find_by(status: status)
      if !tombstone.nil?
        tombstone.destroy!
      end
    end
  end

end
