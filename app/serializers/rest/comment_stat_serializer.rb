# frozen_string_literal: true

class REST::CommentStatSerializer < ActiveModel::Serializer
  attributes :comment_id, :replies_count, :reactions_count, :reaction_id, :reactions_counts

  attribute :reacted, if: :current_user?

  def comment_id
    object.id.to_s
  end

  def reacted
    if instance_options && instance_options[:comment_relationships]
      !!instance_options[:comment_relationships].reactions_map[object.id] || false
    else
      current_user.account.comment_reacted?(object)
    end
  end

  def reactions_counts
    object.reactions_counts
  end

  def reaction_id
    if instance_options && instance_options[:comment_relationships]
      instance_options[:comment_relationships].reactions_map[object.id] || nil
    else
      current_user.account.comment_reaction_id(object)
    end
  end
  
  def reactions_count
    object.reactions_count
  end

  def current_user?
    !current_user.nil?
  end

end
