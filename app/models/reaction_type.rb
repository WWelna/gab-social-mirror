# == Schema Information
#
# Table name: reaction_types
#
#  id                 :bigint(8)        not null, primary key
#  name               :string           not null
#  name_past          :string           not null
#  name_plural        :string           not null
#  slug               :string           not null
#  image_file_name    :string
#  image_content_type :string
#  image_file_size    :bigint(8)
#  image_updated_at   :datetime
#  index              :integer
#  rating             :decimal(5, 2)
#  active_start_date  :datetime
#  active_end_date    :datetime
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#

class ReactionType < ApplicationRecord

  LIMIT = 150.kilobytes

  has_attached_file :image, styles: { static: { format: 'png', convert_options: '-coalesce -strip' } }

  validates_attachment :image, content_type: { content_type: 'image/png' }, presence: true, size: { less_than: LIMIT }

  include Attachmentable
  
  scope :active, -> { where('active_start_date < ?', Time.now).where('active_end_date > ?', Time.now).or(where(active_end_date: nil)) }
  scope :order_by_index, -> { reorder(index: :asc) }

  def is_active?
    now = Time.now
    if active_start_date && active_end_date
      return active_start_date < now && active_end_date > now
    end
    true
  end

  @@reaction_cache = ActiveSupport::Cache::MemoryStore.new

  def self.all_reactions
    @@reaction_cache.fetch('gab:reactions:all', expires_in: 5.minutes) do
      ReactionType.order_by_index.compact
    end
  end

  def self.active_reactions
    @@reaction_cache.fetch('gab:reactions:active', expires_in: 5.minutes) do
      ReactionType.active.order_by_index.compact
    end
  end

  def self.serialized_all_reactions
    @@reaction_cache.fetch('gab:reactions:all_serialized', expires_in: 5.minutes) do
      ActiveModelSerializers::SerializableResource.new(self.all_reactions, each_serializer: REST::ReactionTypeSerializer)
    end   
  end

  def self.serialized_active_reactions
    @@reaction_cache.fetch('gab:reactions:active_serialized', expires_in: 5.minutes) do
      ActiveModelSerializers::SerializableResource.new(self.active_reactions, each_serializer: REST::ReactionTypeSerializer)
    end   
  end

end
