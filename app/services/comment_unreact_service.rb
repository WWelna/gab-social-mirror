# frozen_string_literal: true

class CommentUnreactService < BaseService
  def call(account, comment)
    reaction = CommentReaction.find_by!(account: account, comment: comment)
    reaction.destroy!
    reaction
  end
end
