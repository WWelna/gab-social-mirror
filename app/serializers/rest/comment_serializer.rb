# frozen_string_literal: true

class REST::CommentSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :account_id, :source, :source_id, :language,
    :in_reply_to_id, :in_reply_to_account_id, :text, :text_html, :is_reply,
    :revised_at

  attribute :reacted, if: :current_user?

  belongs_to :account, serializer: REST::AccountSerializer

  def id
    object.id.to_s
  end
  
  def source
    # 
  end

  def source_id
    object.source_id.to_s
  end

  def in_reply_to_id
    object.in_reply_to_id&.to_s
  end

  def in_reply_to_account_id
    object.in_reply_to_account_id&.to_s
  end

  def is_reply
    object.reply?
  end

  def text
    blocked_by_messager = false
    if instance_options && instance_options[:comment_relationships]
      blocked_by_messager = instance_options[:comment_relationships].blocked_by_map[object.account_id] || false
    end

    if blocked_by_messager
      '[HIDDEN – USER BLOCKS YOU]'
    else
      object.text
    end
  end

  def text_html
    blocked_by_messager = false
    if instance_options && instance_options[:comment_relationships]
      blocked_by_messager = instance_options[:comment_relationships].blocked_by_map[object.account_id] || false
    end

    if blocked_by_messager
      '[HIDDEN – USER BLOCKS YOU]'
    else
      Formatter.instance.commentText(object).strip
    end
  end

  def account_id
    object.account_id.to_s
  end

  def reacted
    if instance_options && instance_options[:comment_relationships]
      !!instance_options[:comment_relationships].reactions_map[object.id] || false
    else
      current_user.account.comment_reacted?(object)
    end
  end

  def current_user?
    defined?(current_user) && !current_user.nil?
  end

end
