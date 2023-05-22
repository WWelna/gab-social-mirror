# frozen_string_literal: true

class CommentFilter
  attr_reader :comment, :account, :params

  def initialize(comment, account, preloaded_relations = {}, params)
    @comment = comment
    @account = account
    @preloaded_relations = preloaded_relations
    @params = params
  end

  def filtered?
    return false if !account.nil? && account.id == comment.account_id
    blocked_by_policy? || (account_present? && filtered_comment?) || silenced_account?
  end

  def results
    scope = Comment
    if !@account.nil?
      scope = scope.where(account: @account)
    end
    params.each do |key, value|
      scope = scope.merge scope_for(key, value) if !value.nil? && !value.empty?
    end
    scope
  end

  def unscoped_results
    scope = Comment.unscoped.recent
    if !@account.nil?
      scope = scope.where(account: @account)
    end
    params.each do |key, value|
      scope = scope.merge scope_for(key, value) if !value.nil? && !value.empty?
    end
    scope
  end

  private

  def scope_for(key, value)
    case key.to_sym
    when :text
      Comment.unscoped.where("LOWER(text) LIKE LOWER(?)", "%#{value}%")
    when :id
      Comment.unscoped.where(id: value)
    when :account_id
      Comment.unscoped.where(account_id: value)
    when :source
      Comment.unscoped.where(source: value)
    when :source_id
      Comment.unscoped.where(source_id: value)
    when :created_at_lte
      Comment.unscoped.where("created_at <= ?", value)
    when :created_at_gte
      Comment.unscoped.where("created_at >= ?", value)
    else
      raise "Unknown filter: #{key}"
    end
  end

  def account_present?
    !account.nil?
  end

  def filtered_comment?
    blocking_account? || muting_account?
  end

  def blocking_account?
    @preloaded_relations[:blocking] ? @preloaded_relations[:blocking][comment.account_id] : account.blocking?(comment.account_id)
  end

  def muting_account?
    @preloaded_relations[:muting] ? @preloaded_relations[:muting][comment.account_id] : account.muting?(comment.account_id)
  end

  def silenced_account?
    !account&.silenced? && comment_account_silenced? && !account_following_comment_account?
  end

  def comment_account_silenced?
    comment.account.silenced?
  end

  def account_following_comment_account?
    @preloaded_relations[:following] ? @preloaded_relations[:following][comment.account_id] : account&.following?(comment.account_id)
  end

  def blocked_by_policy?
    !policy_allows_show?
  end

  def policy_allows_show?
    CommentPolicy.new(account, comment, @preloaded_relations).show?
  end
end
