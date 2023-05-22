# frozen_string_literal: true

class REST::CommentRevisionSerializer < ActiveModel::Serializer
  attributes :comment_id, :created_at, :text

  def comment_id
    object.comment_id.to_s
  end

end
