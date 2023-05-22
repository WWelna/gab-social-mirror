# frozen_string_literal: true

class REST::StatusMentionedSerializer < ActiveModel::Serializer
  attributes :status_id, :account_id, :mentioned

  def status_id
    object.id.to_s
  end

  def account_id
    current_user.account.id
  end

  def mentioned
    if !current_user.nil?
      object.active_mentions.where(account_id: current_user.id).count == 1
    else
      false
    end
  end

end
