# frozen_string_literal: true

require 'digest/md5'

class EditCommentService < BaseService
  include Redisable
  
  def call(comment, options = {})
    @comment = comment
    @account = comment.account
    @options = options
    @text = @options[:text] || ''

    validate_attributes!
    validate_links! unless @account.user&.staff?
    validate_mention_count! unless @account.user&.staff?

    revision_text = prepare_revision_text

    process_comment!
    create_revision! revision_text

    @comment
  end

  private

  def validate_attributes!
    removedSpacesText = @text.gsub(/\s+/, "")
    if @text.empty? || @text.nil? || @text.blank? || removedSpacesText.length == 0
      raise GabSocial::ValidationError, 'You cannot post an empty comment.'
    end
  end

  def process_comment!
    @comment.update!(comment_attributes)
    ProcessCommentMentionsService.new.call(@comment)
  end

  def prepare_revision_text
    text = @comment.text.strip()
  end

  def create_revision!(text)
    @comment.comment_revisions.create!({text: text})
  end

  def validate_links!
    return true unless LinkBlock.block?(@text)
    raise GabSocial::NotPermittedError, "A link you are trying to share has been flagged as spam, if you believe this is a mistake please contact support@gab.com and let us know."
  end

  def validate_mention_count!
    return true if @text.length < 8
    return true unless @text.scan(Account::MENTION_RE).length > 8

    raise GabSocial::NotPermittedError, 'Too many @mentions in one post'
  end

  def language_from_option(str)
    ISO_639.find(str)&.alpha2
  end

  def bump_potential_friendship!
    return if !@comment.reply? || @account.id == @comment.in_reply_to_account_id
    # : todo :
    return if @account.following?(@comment.in_reply_to_account_id)
    PotentialFriendshipTracker.record(@account.id, @comment.in_reply_to_account_id, :reply)
  end

  def comment_attributes
    english = @account.user&.locale == 'en'
    lang = language_from_option(@options[:language])
    lang ||= english ? 'en' : nil
    lang ||= @account.user&.setting_default_language&.presence || LanguageDetector.instance.detect(@text, @account)
    {
      text: @text,
      language: lang,
      revised_at: Time.now,
    }.compact
  end

end
