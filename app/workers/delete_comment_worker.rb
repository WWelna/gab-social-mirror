# frozen_string_literal: true

class DeleteCommentWorker
  include Sidekiq::Worker

  sidekiq_options lock: :until_executed, queue: 'pull', retry: 2

  def perform(comment_id)
    return if comment_id.nil?
    comment = Comment.find_by(id: comment_id)
    return if comment.nil?
    DeleteCommentService.new.call(comment)
  end
end
