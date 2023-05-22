# frozen_string_literal: true

# Stats = only the numbers... Flags = user specific booleans
class REST::StatusFlagsSerializer < ActiveModel::Serializer
  attributes :status_id, :bookmarked, :favourited, :mentioned, :muted,
            :pinned, :pinned_by_group, :reaction_id, :reblogged

  def status_id
    object.id.to_s
  end

  def bookmarked
    if current_user?
      current_user.account.bookmarked?(object)
    else
      false
    end
  end

  def favourited
    if instance_options && instance_options[:relationships]
      !!instance_options[:relationships].favourites_map[object.id] || false
    elsif current_user?
      current_user.account.favourited?(object)
    else
      false
    end
  end

  def mentioned
    if current_user?
      object.active_mentions.where(account_id: current_user.id).count == 1
    else
      false
    end
  end

  def muted
    if instance_options && instance_options[:relationships]
      instance_options[:relationships].mutes_map[object.conversation_id] || false
    elsif current_user?
      current_user.account.muting_conversation?(object.conversation)
    else
      false
    end
  end

  def pinned
    if current_user?
      current_user.account.pinned?(object)
    else
      false
    end
  end

  def pinned_by_group
    if !current_user.nil? || !group_id
      !GroupPinnedStatus.where(status_id: object.id, group_id: object.group_id).empty?
    else
      false
    end
  end
  
  def reaction_id
    if instance_options && instance_options[:relationships]
      instance_options[:relationships].favourites_map[object.id] || nil
    elsif current_user?
      current_user.account.reaction_id(object)
    else
      false
    end
  end

  def reblogged
    if instance_options && instance_options[:relationships]
      instance_options[:relationships].reblogs_map[object.id] || false
    elsif current_user?
      current_user.account.reblogged?(object)
    else
      false
    end
  end

  def current_user?
    !current_user.nil?
  end

  private

  def favourite
    current_user.account.favourited?(object)
  end

end
