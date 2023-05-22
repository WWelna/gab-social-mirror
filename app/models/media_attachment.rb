# frozen_string_literal: true
# == Schema Information
#
# Table name: media_attachments
#
#  id                        :bigint(8)        not null, primary key
#  status_id                 :bigint(8)
#  file_file_name            :string
#  file_content_type         :string
#  file_file_size            :integer
#  file_updated_at           :datetime
#  remote_url                :string           default(""), not null
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  shortcode                 :string
#  type                      :integer          default("image"), not null
#  file_meta                 :json
#  account_id                :bigint(8)
#  description               :text
#  scheduled_status_id       :bigint(8)
#  blurhash                  :string
#  media_attachment_album_id :bigint(8)
#  marketplace_listing_id    :bigint(8)
#  file_fingerprint          :string
#

class MediaAttachment < ApplicationRecord
  self.inheritance_column = nil
  self.ignored_columns = ["chat_message_id"]

  enum type: [:image, :gifv, :video, :unknown]

  IMAGE_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.jfif'].freeze
  GIF_FILE_EXTENSIONS = ['.gif'].freeze
  WEBM_FILE_EXTENSIONS = ['.webm'].freeze
  VIDEO_FILE_EXTENSIONS = ['.mp4', '.m4v', '.mov'].freeze

  IMAGE_MIME_TYPES             = ['image/jpeg', 'image/png', 'image/webp'].freeze
  GIF_MIME_TYPES = ['image/gif'].freeze
  WEBM_MIME_TYPES = ['video/webm', 'audio/webm'].freeze
  VIDEO_MIME_TYPES             = ['video/mp4', 'video/quicktime', 'video/ogg', 'video/3gpp'].freeze

  BLURHASH_OPTIONS = {
    x_comp: 4,
    y_comp: 4,
  }.freeze

  IMAGE_STYLES = {
    original: {
      pixels: 1_638_400, # 1280x1280px
      file_geometry_parser: FastGeometryParser,
    },

    small: {
      pixels: 160_000, # 400x400px
      file_geometry_parser: FastGeometryParser,
      blurhash: BLURHASH_OPTIONS,
    },
  }.freeze

  GIF_STYLES = {
    original: {
      pixels: 1_638_400, # 1280x1280px
      file_geometry_parser: FastGeometryParser,
    },
    small: {
      pixels: 160_000,
      format: 'png',
      convert_options: '-coalesce',
      file_geometry_parser: FastGeometryParser,
      blurhash: BLURHASH_OPTIONS,
    },
  }.freeze

  VIDEO_FORMAT_OUTPUT_OPTIONS = {
    'loglevel' => 'fatal',
    'movflags' => '+faststart',
    'c:v'    => 'copy',
    'c:a'    => 'copy',
    'threads'  => '2',
#    'map_metadata' => '-1',
  }

  VIDEO_STYLES = {
    small: {
      convert_options: {
        output: {
#          vf: 'scale=\'720:-1\'',
        },
      },
      format: 'png',
      time: 0,
      file_geometry_parser: FastGeometryParser,
      blurhash: BLURHASH_OPTIONS,
    },
    playable: {
      convert_options: {
        output: VIDEO_FORMAT_OUTPUT_OPTIONS,
      },
      format: 'mp4',
    },
  }.freeze

  WEBM_STYLES = {
    small: {
      convert_options: {
        output: {
#          vf: 'scale=\'720:-1\'',
        },
      },
      format: 'png',
      time: 0,
      file_geometry_parser: FastGeometryParser,
      blurhash: BLURHASH_OPTIONS,
    },
    playable: {
      convert_options: {
        output: VIDEO_FORMAT_OUTPUT_OPTIONS,
      },
      format: 'webm',
    },
  }.freeze

  VIDEO_FORMAT = {
    format: 'mp4',
    content_type: 'video/mp4',
    convert_options: {
      output: VIDEO_FORMAT_OUTPUT_OPTIONS,
    },
  }.freeze

  SIZE_LIMIT = 250.megabytes

  belongs_to :account,          inverse_of: :media_attachments, optional: true
  belongs_to :status,           inverse_of: :media_attachments, optional: true
  belongs_to :scheduled_status, inverse_of: :media_attachments, optional: true
  belongs_to :marketplace_listing, inverse_of: :media_attachments, optional: true

  has_and_belongs_to_many :chat_messages

  has_attached_file :file,
                    styles: ->(f) { file_styles f },
                    processors: ->(f) { file_processors f },
                    convert_options: { all: '-quality 96 -strip +set modify-date +set create-date' }

  validates_attachment_content_type :file, content_type: IMAGE_MIME_TYPES + GIF_MIME_TYPES + VIDEO_MIME_TYPES + WEBM_MIME_TYPES
  validates_attachment_size :file, less_than: SIZE_LIMIT
  remotable_attachment :file, SIZE_LIMIT

  include Attachmentable
  include Paginable

  validates :account, presence: true
  validates :description, length: { maximum: 420 }, if: :local?

  scope :attached,   -> {
    where.not(status_id: nil).or(
      where.not(scheduled_status_id: nil)
    ).or(
      where.not(marketplace_listing_id: nil)
    ).or(      
      where("EXISTS (select 1 from chat_messages_media_attachments where chat_messages_media_attachments.media_attachment_id = media_attachments.id)")
    )
  }
  scope :unattached, -> { where(status_id: nil, scheduled_status_id: nil, marketplace_listing_id: nil).left_joins(:chat_messages).where(chat_messages: { id: nil }) }
  scope :local,      -> { where(remote_url: '') }
  scope :remote,     -> { where.not(remote_url: '') }
  scope :recent,     -> { reorder(id: :desc) }
  scope :excluding_scheduled, -> { where(scheduled_status_id: nil) }
  
  default_scope { order(id: :asc) }

  def is_pro
    return false if account_id.nil?
    account.is_pro
  end

  def local?
    remote_url.blank?
  end

  def needs_redownload?
    file.blank? && remote_url.present?
  end

  def to_param
    shortcode
  end

  def focus=(point)
    return if point.blank?

    x, y = (point.is_a?(Enumerable) ? point : point.split(',')).map(&:to_f)

    meta = file.instance_read(:meta) || {}
    meta['focus'] = { 'x' => x, 'y' => y }

    file.instance_write(:meta, meta)
  end

  def focus
    x = file.meta['focus']['x']
    y = file.meta['focus']['y']

    "#{x},#{y}"
  end

  after_commit :reset_parent_cache, on: :update
  before_create :prepare_description, unless: :local?
  before_create :set_shortcode
  before_post_process :set_type_and_extension
  before_save :set_meta

  class << self
    def supported_mime_types
      IMAGE_MIME_TYPES + GIF_MIME_TYPES + VIDEO_MIME_TYPES + WEBM_MIME_TYPES
    end

    def supported_file_extensions
      IMAGE_FILE_EXTENSIONS + GIF_FILE_EXTENSIONS + VIDEO_FILE_EXTENSIONS + WEBM_FILE_EXTENSIONS
    end

    private

    def file_styles(f)
      if IMAGE_MIME_TYPES.include? f.instance.file_content_type
        IMAGE_STYLES
      elsif GIF_MIME_TYPES.include? f.instance.file_content_type
        GIF_STYLES
      elsif WEBM_MIME_TYPES.include? f.instance.file_content_type
        WEBM_STYLES
      else
        VIDEO_STYLES
      end
    end

    def file_processors(f)
      if VIDEO_MIME_TYPES.include?(f.file_content_type) || WEBM_MIME_TYPES.include?(f.file_content_type)
        [:video_transcoder, :blurhash_transcoder, :type_corrector]
      else
        [:lazy_thumbnail, :blurhash_transcoder, :type_corrector]
      end
    end
  end

  private

  def set_shortcode
    self.type = :unknown if file.blank? && !type_changed?

    return unless local?

    loop do
      self.shortcode = SecureRandom.urlsafe_base64(14)
      break if MediaAttachment.find_by(shortcode: shortcode).nil?
    end
  end

  def prepare_description
    self.description = description.strip[0...420] unless description.nil?
  end

  def set_type_and_extension
    self.type = (VIDEO_MIME_TYPES.include?(file_content_type) || WEBM_MIME_TYPES.include?(file_content_type)) ? :video : :image
  end

  def set_meta
    meta = populate_meta
    return if meta == {}
    file.instance_write :meta, meta
  end

  def populate_meta
    meta = file.instance_read(:meta) || {}

    file.queued_for_write.each do |style, file|
      meta[style] = style == :small || image? ? image_geometry(file) : video_metadata(file)
    end

    meta
  end

  def image_geometry(file)
    width, height = FastImage.size(file.path)

    return {} if width.nil?

    {
      width:  width,
      height: height,
      size: "#{width}x#{height}",
      aspect: width.to_f / height.to_f,
    }
  end

  def video_metadata(file)
    movie = FFMPEG::Movie.new(file.path)

    return {} unless movie.valid?

    {
      width: movie.width,
      height: movie.height,
      frame_rate: movie.frame_rate,
      duration: movie.duration,
      bitrate: movie.bitrate,
    }
  end

  def reset_parent_cache
    return if status_id.nil?
    Rails.cache.delete("statuses/#{status_id}")
  end
end
