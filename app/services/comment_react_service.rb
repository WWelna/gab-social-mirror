# frozen_string_literal: true

class CommentReactService < BaseService
  include Authorization

  def call(account, comment, reactionId = nil)
    if !comment.nil? && comment.account.blocking?(account)
      raise GabSocial::NotPermittedError, "Cannot like or react. @#{comment.account.username} has you blocked."
    end

    if !reactionId.nil?
      reactionType = ReactionType.active.where(id: reactionId).first
      if reactionType.nil?
        raise GabSocial::NotPermittedError, "That reaction is not active"
      end
    end

    reaction = begin
      reaction = CommentReaction.find_by(account: account, comment: comment)
      if reaction.nil?
        reaction = CommentReaction.create!(account: account, comment: comment, reaction_id: reactionId)
      else
        if reaction.reaction_id != reactionId
          reaction.update!(reaction_id: reactionId)
        end
      end
      reaction
    rescue ActiveRecord::RecordNotUnique
      # Race conditions...
      reaction = CommentReaction.find_by!(account: account, comment: comment)
      if reaction.reaction_id != reactionId
        reaction.update!(reaction_id: reactionId)
      end
      reaction
    end

    create_notification(reaction)

    reaction
  end

  private

  def create_notification(reaction)
    comment = reaction.comment
    NotifyService.new.call(comment.account, reaction)
  end

end
