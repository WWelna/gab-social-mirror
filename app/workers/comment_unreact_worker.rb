# frozen_string_literal: true

class CommentUnreactWorker
  include Sidekiq::Worker

  def perform(account_id, comment_id)
    CommentUnreactService.new.call(Account.find(account_id), Comment.find(comment_id))
  rescue ActiveRecord::RecordNotFound
    true
  end
end
