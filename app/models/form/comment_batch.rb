# frozen_string_literal: true

class Form::CommentBatch
  include ActiveModel::Model
  include AccountableConcern

  attr_accessor :comment_ids, :action, :current_account

  def save
    case action
    when 'delete'
      delete_comments
    when 'tombstone'
      tombstone_comments
    when 'un_tombstone'
      untombstone_comments
    end
  end

  private

  def delete_comments
    Comment.where(id: comment_ids).reorder(nil).find_each do |comment|
      DeleteCommentWorker.perform_async(comment.id)
      log_action :destroy, comment
    end

    true
  end

  def tombstone_comments
    Comment.where(id: comment_ids).reorder(nil).find_each do |comment|
      comment.update!(tombstoned_at: Time.now)
      CommentTombstone.create(comment: comment)
      log_action :tombstone, comment
    end

    true
  end

  def untombstone_comments
    Comment.unscoped.where(id: comment_ids).reorder(nil).find_each do |comment|
      comment.update!(tombstoned_at: nil)
      tombstone = CommentTombstone.find_by(comment: comment)
      if !tombstone.nil?
        tombstone.destroy!
      end
      log_action :un_tombstone, comment
    end

    true
  end
end
