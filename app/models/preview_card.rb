# frozen_string_literal: true
# == Schema Information
#
# Table name: preview_cards
#
#  id                 :bigint(8)        not null, primary key
#  url                :string           default(""), not null
#  title              :string           default(""), not null
#  description        :string           default(""), not null
#  image_file_name    :string
#  image_content_type :string
#  image_file_size    :integer
#  image_updated_at   :datetime
#  type               :integer          default("link"), not null
#  html               :text             default(""), not null
#  author_name        :string           default(""), not null
#  author_url         :string           default(""), not null
#  provider_name      :string           default(""), not null
#  provider_url       :string           default(""), not null
#  width              :integer          default(0), not null
#  height             :integer          default(0), not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  embed_url          :string           default(""), not null
#  image_fingerprint  :string
#

class PreviewCard < ApplicationRecord
  IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].freeze
  LIMIT = 4.megabytes

  self.inheritance_column = false

  enum type: [:link, :photo, :video, :rich]

  has_and_belongs_to_many :statuses
  has_and_belongs_to_many :chat_messages

  has_attached_file :image, styles: ->(f) { image_styles(f) }, convert_options: { all: '-quality 96 -strip' }

  include Attachmentable

  validates :url, presence: true, uniqueness: true
  validates_attachment_content_type :image, content_type: IMAGE_MIME_TYPES
  validates_attachment_size :image, less_than: LIMIT
  remotable_attachment :image, LIMIT

  before_save :extract_dimensions, if: :link?
  before_save :image_not_blocked, if: :link?

  def missing_image?
    width.present? && height.present? && image_file_name.blank?
  end

  def blocked_image?
    image_fingerprint.present? && ImageBlock.where(md5: image_fingerprint).exists?
  end

  def save_with_optional_image!
    save!
  rescue ActiveRecord::RecordInvalid
    self.image = nil
    save!
  end

  class << self
    SEARCH_FIELDS = %i[title description url].freeze

    def search_for(term)
      SEARCH_FIELDS.inject(none) { |r, f| r.or(matching(f, :contains, term)) }
        .pluck(:id)
    end

    private

    def image_styles(f)
      styles = {
        original: {
          geometry: '1280x1280>',
          file_geometry_parser: FastGeometryParser,
          convert_options: '-coalesce -strip',
        },
      }

      styles[:original][:format] = 'jpg' if f.instance.image_content_type == 'image/gif'
      styles
    end
  end

  private

  def extract_dimensions
    file = image.queued_for_write[:original]

    return if file.nil?

    width, height = FastImage.size(file.path)

    return nil if width.nil?

    raise GabSocial::NotPermittedError, 'Media could not be attached.' if width > 8192 || height > 8192

    self.width  = width
    self.height = height
  end

  def image_not_blocked
    return if image_file_name.blank? || image.queued_for_write[:original].nil?
    image_fingerprint = Digest::MD5.file(image.queued_for_write[:original].path).hexdigest
    if blocked_image?
      raise GabSocial::NotPermittedError, 'Media could not be attached.'
    end

  end
end
