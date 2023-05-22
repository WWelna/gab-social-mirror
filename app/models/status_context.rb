# == Schema Information
#
# Table name: status_contexts
#
#  id         :bigint(8)        not null, primary key
#  owner_id   :bigint(8)        not null
#  owner_type :integer          not null
#  name       :string
#  is_global  :boolean          default(FALSE), not null
#  is_enabled :boolean          default(FALSE), not null
#  index      :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class StatusContext < ApplicationRecord
  
  enum owner_type: [
    :account,
    :group,
  ], _suffix: :context_owner_type

  validates_with StatusContextValidator

  validates :name, presence: true, length: { maximum: 50 }
  
  scope :owned_by_group, -> { where(owner_type: :group) }
  scope :is_global, -> { where(is_global: true, owner_type: :account) }
  scope :is_enabled, -> { where(is_enabled: true) }
  scope :order_by_index, -> { reorder(index: :asc) }

  def is_group?
    self.owner_type == :group
  end

  @@global_status_context_cache = ActiveSupport::Cache::MemoryStore.new

  def self.enabled_global_status_contexts
    @@global_status_context_cache.fetch('gab:status_contexts:global_enabled', expires_in: 5.minutes) do
      StatusContext.is_enabled.is_global.order_by_index.compact
    end
  end

  def self.serialized_enabled_global_status_contexts
    @@global_status_context_cache.fetch('gab:status_contexts:global_enabled_serialized', expires_in: 5.minutes) do
      ActiveModelSerializers::SerializableResource.new(self.enabled_global_status_contexts, each_serializer: REST::StatusContextSerializer)
    end   
  end


end
