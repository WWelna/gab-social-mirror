# frozen_string_literal: true

class WebpAccount
  CONTENT_TYPE = 'image/jpeg'

  def self.fix_all!
    [
      [Account, %i[header avatar]],
      # [Group, %i[cover_image]]
    ].each do |klass, fields|
      fields.
        map { |field| klass.where({ "#{field}_content_type" => CONTENT_TYPE }) }.
        reduce(:or).
        find_each { |record| fix!(record, fields) }
    end
  end

  def self.fix!(record, fields)
    atts = fields.each_with_object({}) do |field, hsh|
      next unless record.send("#{field}_content_type") == CONTENT_TYPE

      hsh[field] = WebpPngFile.new(record.send(field)).uploaded_file
    end

    record.update!(atts)
  end

end

class WebpPngFile
  def initialize(paperclip_attachment)
    @paperclip_attachment = paperclip_attachment
  end

  def uploaded_file
    ActionDispatch::Http::UploadedFile.new({
      tempfile: tempfile,
      content_type: 'image/png',
      filename: "#{basename}.png",
    })
  end

private
  def basename
    File.basename(@paperclip_attachment.original_filename, '.*')
  end

  def data
    @data ||= if url.match?(%r{\A/[^/]})
      path = url.
        sub(/\?.*/, ''). # remove querystring
        delete_prefix('/') # make it a relative path

      Rails.root.join('public', path).read
    else
      HTTP.get(url).body.to_s
    end
  end

  def original_tempfile
    @original_tempfile ||= begin
      file = Tempfile.new([basename, '.jpg'])
      file.binmode
      file << data
      file
    end
  end

  def tempfile
    @tempfile ||= begin
      file = Tempfile.new([basename, '.png'])
      `convert #{original_tempfile.path} #{file.path}`
      file
    end
  end

  def url
    @url ||= @paperclip_attachment.url(:original)
  end
end

desc 'Convert webp Account headers and avatars to png and Group cover photos'
task webp_to_png: :environment do
  WebpAccount.fix_all!
end
