# frozen_string_literal: true

class DeleteCommentWorker
  include Sidekiq::Worker

  sidekiq_options lock: :until_executed

  def perform(comment_id)
    return if comment_id.nil?
    comment = Comment.find_by(id: comment_id)
    return if comment.nil?
    DeleteCommentService.new.call(comment)
  end
end
