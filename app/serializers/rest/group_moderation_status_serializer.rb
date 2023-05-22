
class REST::GroupModerationStatusSerializer < ActiveModel::Serializer
  attributes :id,
    :created_at,
    :in_reply_to_id,
    :sensitive,
    :spoiler_text,
    :visibility,
    :language,
    :quote_of_id,
    :has_quote,
    :quote,
    :poll,
    :media_attachments,
    :content

  belongs_to :account, serializer: REST::AccountSerializer
  belongs_to :group, serializer: REST::GroupSerializer

  def in_reply_to_id
    object.content['in_reply_to_id']
  end

  def sensitive
    object.content['sensitive']
  end

  def spoiler_text
    object.content['spoiler_text'] || ''
  end

  def visibility
    object.content['visibility']
  end

  def language
    object.content['language']
  end

  def quote_of_id
    has_quote && object.content['quote_of_id'].to_s
  end

  def has_quote
    return false if object.content['quote_of_id'].nil?
    begin
      Status.find(object.content['quote_of_id'])
      true
    rescue => e
      false
    end
  end

  def quote
    if has_quote
      q = Status.find(object.content['quote_of_id'])
      REST::StatusSerializer.new(q)
    end
  end
  
  def poll
    object.content['poll']
  end

  def media_attachments
    begin
      ids = object.content['media_ids'] || []
      found_ids = MediaAttachment.unscoped.where(id: ids)
      found_ids = found_ids.map { |ma| REST::MediaAttachmentSerializer.new(ma) }
    rescue => e
      found_ids = MediaAttachment.none.map { |ma| REST::MediaAttachmentSerializer.new(ma) }
    end
    found_ids
  end

  def content
    (object.content['text'] || '').html_safe
  end
end
