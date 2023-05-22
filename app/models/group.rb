# == Schema Information
#
# Table name: groups
#
#  id                       :bigint(8)        not null, primary key
#  account_id               :bigint(8)
#  title                    :string           not null
#  description              :string           not null
#  cover_image_file_name    :string
#  cover_image_content_type :string
#  cover_image_file_size    :integer
#  cover_image_updated_at   :datetime
#  is_nsfw                  :boolean          default(FALSE), not null
#  is_featured              :boolean          default(FALSE), not null
#  is_archived              :boolean          default(FALSE), not null
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  member_count             :integer          default(0)
#  slug                     :text
#  is_private               :boolean          default(FALSE)
#  is_visible               :boolean          default(TRUE)
#  tags                     :string           default([]), is an Array
#  password                 :string
#  group_category_id        :integer
#  is_verified              :boolean          default(FALSE), not null
#  is_moderated             :boolean
#  rules                    :json
#  theme_color              :text
#  is_admins_visible        :boolean
#  paused_at                :datetime
#  is_members_visible       :boolean
#  is_questions_enabled     :boolean
#

class Group < ApplicationRecord
  self.ignored_columns = ["group_categories_id"]

  include Paginable
  include GroupInteractions
  include GroupCoverImage
  include Attachmentable

  PER_ACCOUNT_LIMIT_PRO = 100
  PER_ACCOUNT_LIMIT_NORMAL = 10

  belongs_to :account, optional: true

  has_many :group_accounts, inverse_of: :group, dependent: :destroy
  has_many :accounts, through: :group_accounts

  has_many :group_join_requests, inverse_of: :group, dependent: :destroy
  has_many :join_requests, source: :account, through: :group_join_requests

  has_many :group_pinned_statuses, inverse_of: :group, dependent: :destroy
  has_many :pinned_statuses, source: :status, through: :group_pinned_statuses

  has_many :group_removed_accounts, inverse_of: :group, dependent: :destroy
  has_many :removed_accounts, source: :account, through: :group_removed_accounts

  has_many :group_questions, inverse_of: :group, dependent: :destroy
  has_many :group_question_answers, inverse_of: :group, dependent: :destroy
  has_many :group_account_badges, inverse_of: :group, dependent: :destroy

  belongs_to :group_categories, optional: true, foreign_key: 'group_category_id'

  validates :title, presence: true
  validates :description, presence: true

  validates_each :account_id, on: :create do |record, _attr, value|
    account = Account.find(value)
    limit = account.is_pro ? PER_ACCOUNT_LIMIT_PRO : PER_ACCOUNT_LIMIT_NORMAL
    record.errors.add(:base, "You have reached the limit for group creation.") if Group.where(account_id: value).count >= limit
  end

  before_save :set_slug
  before_save :set_password
  after_create :add_owner_to_accounts

  scope :alphabetical, -> { order(arel_table['title'].lower.asc) }

  class << self
    def search_for(term, offset = 0, limit = 25)
      Group.matching(:title, :contains, term)
        .includes(:group_categories)
        .where(is_archived: false, is_visible: true)
        .order(member_count: :desc)
        .limit(limit)
        .offset(offset)
    end

    def search_for_members(group, term, limit)
      group.accounts.matching(:username, :contains, term).limit(limit)
    end

    def search_for_removed_accounts(group, term, limit)
      group.removed_accounts.matching(:username, :contains, term).limit(limit)
    end
  end

  def cache_key
    "groups/#{id}-#{cache_version}"
  end

  def has_password?
    self.password.present? && self.password != 'null'
  end

  def is_paused?
    self.paused_at.present?
  end

  def is_enabled_and_has_questions?
    self.is_questions_enabled && group.group_questions.count > 0
  end
  
  private

  def set_password
    self.password = nil unless self.has_password?
  end

  def set_slug
    if !slug.nil? && self.member_count > 50 && self.slug.nil?
      self.slug = slug.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
    elsif !slug.nil? && self.member_count < 50 && self.slug.nil?
      self.slug = nil
    else
      self.slug = self.slug
    end
  end

  def add_owner_to_accounts
    group_accounts << GroupAccount.new(account: account, role: :admin, write_permissions: true)
  end

end
