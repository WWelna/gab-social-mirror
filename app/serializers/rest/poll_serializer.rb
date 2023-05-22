# frozen_string_literal: true

class REST::PollSerializer < ActiveModel::Serializer
  attributes :id, :expires_at, :expired,
             :multiple, :votes_count

  has_many :loaded_options, key: :options, serializer: REST::PollOptionSerializer
  has_many :emojis, serializer: REST::CustomEmojiSerializer

  attribute :voted, if: :current_user?
  attribute :voted_for, if: :current_user?

  def id
    object.id.to_s
  end

  def expired
    object.expired?
  end

  def voted
    object.voted?(current_user.account)
  end

  def voted_for
    if voted && !object.account.id != current_user.account.id
      vote = object.votes.where(account: current_user.account).first
      if !vote.nil?
        vote.choice.to_s
      else
        nil
      end
    else 
      nil
    end
  end

  def current_user?
    defined?(current_user) && !current_user.nil?
  end

end
