# frozen_string_literal: true

class REST::CommentMentionedSerializer < ActiveModel::Serializer
  attributes :comment_id, :account_id, :mentioned

  def comment_id
    object.id.to_s
  end

  def account_id
    current_user.account.id
  end

  def mentioned
    if !current_user.nil?
      object.active_comment_mentions.where(account_id: current_user.id).count == 1
    else
      false
    end
  end

end
