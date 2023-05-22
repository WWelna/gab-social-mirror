# frozen_string_literal: true

class Form::StatusBatch
  include ActiveModel::Model
  include AccountableConcern

  attr_accessor :status_ids, :action, :current_account

  def save
    case action
    when 'nsfw_on', 'nsfw_off'
      change_sensitive(action == 'nsfw_on')
    when 'delete'
      delete_statuses
    when 'tombstone'
      tombstone_statuses
    when 'un_tombstone'
      untombstone_statuses
    end

  end

  private

  def change_sensitive(sensitive)
    media_attached_status_ids = MediaAttachment.where(status_id: status_ids).pluck(:status_id)

    ApplicationRecord.transaction do
      Status.where(id: media_attached_status_ids).reorder(nil).find_each do |status|
        status.update!(sensitive: sensitive)
        log_action :update, status
      end
    end

    true
  rescue ActiveRecord::RecordInvalid
    false
  end

  def delete_statuses
    Status.where(id: status_ids).reorder(nil).find_each do |status|
      RemovalWorker.perform_async(status.id)
      Tombstone.find_or_create_by(uri: status.uri, account: status.account, by_moderator: true)
      log_action :destroy, status
    end

    true
  end

  def tombstone_statuses
    Status.where(id: status_ids).reorder(nil).find_each do |status|
      status.update!(tombstoned_at: Time.now)
      StatusTombstone.create(status: status)
      log_action :tombstone, status
    end

    true
  end

  def untombstone_statuses
    Status.unscoped.where(id: status_ids).reorder(nil).find_each do |status|
      status.update!(tombstoned_at: nil)
      tombstone = StatusTombstone.find_by(status: status)
      if !tombstone.nil?
        tombstone.destroy!
      end
      log_action :un_tombstone, status
    end

    true
  end
end
