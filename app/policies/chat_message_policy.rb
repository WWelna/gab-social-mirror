# frozen_string_literal: true

class ChatMessagePolicy < ApplicationPolicy
  def initialize(current_account, record, preloaded_relations = {})
    super(current_account, record)

    @preloaded_relations = preloaded_relations
  end

  def index?
    staff?
  end

  def show?
    if requires_mention?
      owned? || mention_exists?
    elsif private?
      owned? || following_author? || mention_exists?
    else
      current_account.nil? || !author_blocking?
    end
  end

  def destroy?
    staff? || owned?
  end

  alias unreblog? destroy?

  def update?
    staff? || owned?
  end

  private

  def owned?
    author.id == current_account&.id
  end

  def mention_exists?
    return false if current_account.nil?

    if record.mentions.loaded?
      record.mentions.any? { |mention| mention.account_id == current_account.id }
    else
      record.mentions.where(account: current_account).exists?
    end
  end

  def blocking_author?
    return false if current_account.nil?

    @preloaded_relations[:blocking] ? @preloaded_relations[:blocking][author.id] : current_account.blocking?(author)
  end

  def author_blocking?
    return false if current_account.nil?

    @preloaded_relations[:blocked_by] ? @preloaded_relations[:blocked_by][author.id] : author.blocking?(current_account)
  end

  def following_author?
    return false if current_account.nil?

    @preloaded_relations[:following] ? @preloaded_relations[:following][author.id] : current_account.following?(author)
  end

  def author
    record.account
  end
end
