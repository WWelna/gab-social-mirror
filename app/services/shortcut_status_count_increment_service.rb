# frozen_string_literal: true

class ShortcutStatusCountIncrementService < BaseService
  
  def call(status)
    return true if status.nil?

    account_id = status.account_id
    group_id = status.group.id if !status.group.nil?

    shortcuts_query = Shortcut.where(
      'unread_count < ? and shortcut_type = ? and shortcut_id = ?', 
      100, 'account', account_id
    )
    if !group_id.nil?
      shortcuts_query = shortcuts_query.or(
        Shortcut.where(
          'unread_count < ? and shortcut_type = ? and shortcut_id = ?', 
          100, 'group', group_id
        )
      )
    end
    shortcuts = shortcuts_query.in_batches do |batch|
      ids = batch.collect &:id
      Shortcut.where(id: ids).update_all('unread_count = unread_count + 1')
    end
    true
  end

end
