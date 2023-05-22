# frozen_string_literal: true

class BatchedTombstoneStatusService < BaseService

  def call(statuses, **options)
    statuses = Status.where(id: statuses.map(&:id))

    statuses.each do |status|
      status.update!(tombstoned_at: Time.now)
      StatusTombstone.create(status: status)
    end
  end

end
