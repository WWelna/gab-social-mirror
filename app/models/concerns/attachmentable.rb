# frozen_string_literal: true

require 'mime/types/columnar'
require 'net/http'

module Attachmentable
  extend ActiveSupport::Concern

  MAX_MATRIX_LIMIT = 169_000_000 # 13000x13000px

  included do
    before_post_process :obfuscate_file_name
    before_post_process :set_file_extensions
    before_post_process :check_image_dimensions
    before_post_process :set_file_content_type
    before_post_process :check_image_nsfw
  end

  private

  def set_file_content_type
    self.class.attachment_definitions.each_key do |attachment_name|
      attachment = send(attachment_name)

      next if attachment.blank? || attachment.queued_for_write[:original].blank?

      attachment.instance_write :content_type, calculated_content_type(attachment)
    end
  end

  def set_file_extensions
    self.class.attachment_definitions.each_key do |attachment_name|
      attachment = send(attachment_name)

      next if attachment.blank?

      attachment.instance_write :file_name, [Paperclip::Interpolations.basename(attachment, :original), appropriate_extension(attachment)].delete_if(&:blank?).join('.')
    end
  end

  def check_image_dimensions
    self.class.attachment_definitions.each_key do |attachment_name|
      attachment = send(attachment_name)

      next if attachment.blank? || !/image.*/.match?(attachment.content_type) || attachment.queued_for_write[:original].blank?

      width, height = FastImage.size(attachment.queued_for_write[:original].path)
      raise GabSocial::DimensionsValidationError, "#{width}x#{height} images are not supported, must be below #{MAX_MATRIX_LIMIT} sqpx" if width.present? && height.present? && (width * height >= MAX_MATRIX_LIMIT)
    end
  end

  def check_image_nsfw
    return if !self.is_a?(Account) && !self.is_a?(MediaAttachment)    
    account = self.is_a?(Account) ? self : self.account
    self.class.attachment_definitions.each_key do |attachment_name|
      attachment = send(attachment_name)

      next if attachment.blank? || !/image.*/.match?(attachment.content_type) || attachment.queued_for_write[:original].blank? || account.nil?

      if ENV['CHECK_NSFW_SERVICE'] && attachment.content_type.start_with?('image/') && account.created_at > 1.month.ago
        begin
          log = Logger.new(ENV['CHECK_NSFW_LOG'] || STDOUT)
          url = URI.parse("#{ENV['CHECK_NSFW_SERVICE']}/image#{attachment.queued_for_write[:original].path}")
          req = Net::HTTP::Get.new(url.request_uri)
          res = Net::HTTP.start(url.host, url.port) { |http| http.request(req) }        
          score = Float(res.body)
          log.info "NSFW score: #{score} for user https://gab.com/admin/accounts/#{account.id}"
          threshold = 0.9
          bad = score >= threshold
          if bad
            raise GabSocial::ValidationError, 'This image appears to contain NSFW content which is not allowed on Gab, please contact support@gab.com if you feel this is in error.'
          end
        rescue => e
          raise if e.is_a?(GabSocial::ValidationError)
          log.info "NSFW check failed for user https://gab.com/admin/accounts/#{account.id} with error #{e}"
        end
      end

    end
  end  

  def appropriate_extension(attachment)
    mime_type = MIME::Types[attachment.content_type]
    extensions_for_mime_type = mime_type.empty? ? [] : mime_type.first.extensions
    original_extension       = Paperclip::Interpolations.extension(attachment, :original)
    proper_extension         = extensions_for_mime_type.first.to_s
    extension                = extensions_for_mime_type.include?(original_extension) ? original_extension : proper_extension
    extension                = 'jpeg' if extension == 'jpe'

    extension
  end

  def calculated_content_type(attachment)
    content_type = Paperclip.run('file', '-b --mime :file', file: attachment.queued_for_write[:original].path).split(/[:;\s]+/).first.chomp
    content_type = 'video/mp4' if content_type == 'video/x-m4v'
    content_type
  rescue Terrapin::CommandLineError
    ''
  end

  def obfuscate_file_name
    self.class.attachment_definitions.each_key do |attachment_name|
      attachment = send(attachment_name)

      next if attachment.blank? || attachment.queued_for_write[:original].blank?

      attachment.instance_write :file_name, SecureRandom.hex(8) + File.extname(attachment.instance_read(:file_name))
    end
  end
end
