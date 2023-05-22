# == Schema Information
#
# Table name: comment_reactions
#
#  id          :bigint(8)        not null, primary key
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  account_id  :bigint(8)        not null
#  comment_id  :bigint(8)        not null
#  reaction_id :bigint(8)
#

class CommentReaction < ApplicationRecord
  include Paginable

  belongs_to :account, inverse_of: :comment_reactions
  belongs_to :comment,  inverse_of: :comment_reactions

  has_one :notification, as: :activity, dependent: :destroy
  validates :comment_id, uniqueness: { scope: :account_id }
  validates_with CommentReactionLimitValidator, on: :create

  # : hack : first reaction_id must be 'LIKE'!
  scope :likes, -> { where(reaction_id: [nil, 1]) }

  after_create :increment_cache_counters
  after_destroy :decrement_cache_counters

  private

  def increment_cache_counters
    comment&.increment_count!(:reactions_count)
  end

  def decrement_cache_counters
    return if association(:comment).loaded? && (comment.marked_for_destruction? || comment.marked_for_mass_destruction?)
    comment&.decrement_count!(:reactions_count)
  end
end
