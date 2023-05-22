# frozen_string_literal: true

class CommentPolicy < ApplicationPolicy
  def initialize(current_account, record, preloaded_relations = {})
    super(current_account, record)

    @preloaded_relations = preloaded_relations
  end

  def index?
    staff?
  end

  def show?
    return false if author.suspended?
    return true if owned? || staff?
    return false if blocking_author?

    true
  end

  def react?
    !author_blocking?
  end

  def destroy?
    staff? || owned?
  end

  def update?
    staff? || owned?
  end

  private

  def owned?
    author.id == current_account&.id
  end

  def blocking_author?
    return false if current_account.nil?
    return false if owned?

    @preloaded_relations[:blocking] ? @preloaded_relations[:blocking][author.id] : current_account.blocking?(author)
  end

  def author_blocking?
    return false if current_account.nil?
    return false if owned?
    
    @preloaded_relations[:blocked_by] ? @preloaded_relations[:blocked_by][author.id] : author.blocking?(current_account)
  end

  def author
    record.account
  end

end
