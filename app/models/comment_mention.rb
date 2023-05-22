# == Schema Information
#
# Table name: comment_mentions
#
#  id         :bigint(8)        not null, primary key
#  account_id :bigint(8)
#  comment_id :bigint(8)
#  silent     :boolean          default(FALSE)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class CommentMention < ApplicationRecord
  belongs_to :account, inverse_of: :comment_mentions
  belongs_to :comment
  
  has_one :notification, as: :activity, dependent: :destroy

  validates :account, uniqueness: { scope: :comment }

  scope :active, -> { where(silent: false) }
  scope :silent, -> { where(silent: true) }

  delegate(
    :username,
    :acct,
    to: :account,
    prefix: true
  )

  def active?
    !silent?
  end
end
