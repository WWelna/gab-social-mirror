# frozen_string_literal: true

class REST::CommentMutedSerializer < ActiveModel::Serializer
  attributes :comment_id, :account_id, :muted

  def comment_id
    object.id.to_s
  end

  def account_id
    current_user.account.id
  end

  def muted
    if !current_user.nil?
      current_user.account.muting_comment_conversation?(object)
    else
      false
    end
  end

end
