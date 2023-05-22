# frozen_string_literal: true

class REST::CommentReactionSerializer < ActiveModel::Serializer
  attributes :id, :account_id, :comment_id, :reaction_id

  def id
    object.id.to_s
  end

  def account_id
    object.account_id.to_s
  end

  def comment_id
    object.comment_id.to_s
  end

  def reaction_id
    object.reaction_id.nil? ? '1' : object.reaction_id.to_s
  end

end