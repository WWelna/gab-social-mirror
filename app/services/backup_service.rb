# frozen_string_literal: true

require 'rubygems/package'

# : todo :
# albums
# bookmarks
# bookmark collections
# chat messages
# chat conversations
# joined group
# removed groups

class BackupService < BaseService
  attr_reader :account, :backup, :collection

  def call(backup)
    @backup  = backup
    @account = backup.user.account

    build_json!
    build_archive!
  end

  private

  def build_json!
    @collection = serialize(collection_presenter, ActivityPub::CollectionSerializer)

    account.statuses.with_includes.reorder(nil).find_in_batches do |statuses|
      statuses.each do |status|
        item = serialize(status, REST::StatusSerializer)
        item.delete(:'@context')

        #unless item[:type] == 'Announce' || item[:object][:attachment].blank?
        #  item[:object][:attachment].each do |attachment|
        #    attachment[:url] = Addressable::URI.parse(attachment[:url]).path.gsub(/\A\/system\//, '')
        #  end
        #end

        @collection[:orderedItems] << item
      end

      GC.start
    end
  end

  def build_archive!
    tmp_file = Tempfile.new(%w(archive .tar.gz))

    File.open(tmp_file, 'wb') do |file|
      Zlib::GzipWriter.wrap(file) do |gz|
        Gem::Package::TarWriter.new(gz) do |tar|
          dump_media_attachments!(tar)
          dump_outbox!(tar)
          dump_likes!(tar)
          dump_actor!(tar)
        end
      end
    end

    archive_filename = ['archive', Time.now.utc.strftime('%Y%m%d%H%M%S'), SecureRandom.hex(16)].join('-') + '.tar.gz'

    @backup.dump      = ActionDispatch::Http::UploadedFile.new(tempfile: tmp_file, filename: archive_filename)
    @backup.processed = true
    @backup.save!
  ensure
    tmp_file.close
    tmp_file.unlink
  end

  def dump_media_attachments!(tar)
    MediaAttachment.attached.where(account: account).reorder(nil).find_in_batches do |media_attachments|
      media_attachments.each do |m|
        wrap_download(tar, m)
      end
      GC.start
    end
  end

  def wrap_download(tar, m)
    basename = File.basename(m.file.path)
    download_to_tar(tar, m.file, 'media_attachments/' + basename)
  rescue Errno::ENOENT
    nil
  end

  def dump_outbox!(tar)
    json = Oj.dump(collection)

    tar.add_file_simple('statuses.json', 0o644, json.bytesize) do |io|
      io.write(json)
    end
  end

  def dump_actor!(tar)
    actor = serialize(account, REST::AccountSerializer)

    actor[:icon][:url]  = 'avatar' + File.extname(actor[:icon][:url])  if actor[:icon]
    actor[:image][:url] = 'header' + File.extname(actor[:image][:url]) if actor[:image]

    download_to_tar(tar, account.avatar, 'avatar' + File.extname(account.avatar.path)) if account.avatar.exists?
    download_to_tar(tar, account.header, 'header' + File.extname(account.header.path)) if account.header.exists?

    json = Oj.dump(actor)

    tar.add_file_simple('account.json', 0o644, json.bytesize) do |io|
      io.write(json)
    end
  end

  def dump_likes!(tar)
    collection = serialize(ActivityPub::CollectionPresenter.new(id: 'likes.json', type: :ordered, size: 0, items: []), ActivityPub::CollectionSerializer)

    Status.reorder(nil).joins(:favourites).includes(:account).merge(account.favourites).find_in_batches do |statuses|
      statuses.each do |status|
        collection[:totalItems] += 1
        collection[:orderedItems] << TagManager.instance.url_for(status)
      end

      GC.start
    end

    json = Oj.dump(collection)

    tar.add_file_simple('likes.json', 0o644, json.bytesize) do |io|
      io.write(json)
    end
  end

  def collection_presenter
    ActivityPub::CollectionPresenter.new(
      id: 'statuses.json',
      type: :ordered,
      size: account.statuses_count,
      items: []
    )
  end

  def serialize(object, serializer)
    ActiveModelSerializers::SerializableResource.new(
      object,
      serializer: serializer,
      adapter: ActivityPub::Adapter
    ).as_json
  end

  CHUNK_SIZE = 1.megabyte

  def download_to_tar(tar, attachment, filename)
    adapter = Paperclip.io_adapters.for(attachment)

    tar.add_file_simple(filename, 0o644, adapter.size) do |io|
      while (buffer = adapter.read(CHUNK_SIZE))
        io.write(buffer)
      end
    end
  end
end
