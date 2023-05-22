# frozen_string_literal: true

class CommentRelationshipsPresenter
  attr_reader :reactions_map, :mutes_map, :blocked_by_map

  def initialize(comments, current_account_id = nil, **options)
    comments = comments.compact
    comment_ids = comments.flat_map { |s| [s.id] }.uniq.compact

    if current_account_id.nil? || comments.empty?
      @reactions_map = {}
      @mutes_map = {}
      @blocked_by_map = {}
    else
      comment_conversation_ids = comments.map(&:comment_conversation_id).compact.uniq
      comment_account_ids = comments.map(&:account_id).compact.uniq.reject { |account_id| account_id.to_s == current_account_id.to_s }

      @reactions_map = Comment.reactions_map(comment_ids).merge(options[:reactions_map] || {})
      @mutes_map = Comment.mutes_map(comment_conversation_ids, current_account_id).merge(options[:mutes_map] || {})
      @blocked_by_map = Account.blocked_by_map(comment_account_ids, current_account_id)
    end

  end
end
