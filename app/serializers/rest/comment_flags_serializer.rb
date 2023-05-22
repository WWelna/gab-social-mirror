# frozen_string_literal: true

# Stats = only the numbers... Flags = user specific booleans
class REST::CommentFlagsSerializer < ActiveModel::Serializer
  attributes :comment_id, :reacted, :mentioned, :reaction_id

  def comment_id
    object.id.to_s
  end

  def reacted
    if instance_options && instance_options[:comment_relationships]
      !!instance_options[:comment_relationships].reactions_map[object.id] || false
    elsif current_user?
      current_user.account.comment_reacted?(object)
    else
      false
    end
  end

  def mentioned
    if current_user?
      object.active_comment_mentions.where(account_id: current_user.id).count == 1
    else
      false
    end
  end

  def reaction_id
    if instance_options && instance_options[:comment_relationships]
      instance_options[:comment_relationships].reactions_map[object.id] || nil
    elsif current_user?
      current_user.account.comment_reaction_id(object)
    else
      false
    end
  end

  def current_user?
    !current_user.nil?
  end

  private

  def favourite
    current_user.account.comment_reacted?(object)
  end

end