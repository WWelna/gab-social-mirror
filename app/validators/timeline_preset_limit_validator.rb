# frozen_string_literal: true

class TimelinePresetLimitValidator < ActiveModel::Validator
  MAX_PRESETS_PER_ACCOUNT_LIMIT = 100

  def validate(preset)
    # check to make sure timeline_id model exists if given
    timeline_type = preset.timeline
    timeline_id = preset.timeline_id
    timeline_entity_exists = true

    if timeline_type == 'group'
      timeline_exists = Group.where(id: timeline_id, is_archived: false).exists?
    elsif timeline_type == 'account'
      timeline_exists = Account.where(id: shortcut_id).without_suspended.exists?
    elsif timeline_type == 'list'
      timeline_exists = List.where(id: shortcut_id).public_only.exists?
    elsif timeline_type == 'tag'
      # find tag by name instead of id since we send up the tag (i.e. "testhashtag")
      timeline_exists = Tag.where(name: shortcut_id).exists?
    else
      # reset timeline_id because it's not using a specific model
      if !timeline_id.nil?
        # error, cannot have id without "timeline"... must have one of the above
        preset.errors.add(:base, 'Invalid timeline id for given timeline.')
      end
    end

    if timeline_exists == false 
      preset.errors.add(:base, 'Invalid timeline id for given timeline. Entity not found.')
    end

    preset.errors.add(:base, 'You have reached the maximum amount of timeline presets.') if limit_reached?(preset.account)
  end

  private

  def limit_reached?(account)
    TimelinePreset.where(account: account).count >= MAX_PRESETS_PER_ACCOUNT_LIMIT
  end
end
