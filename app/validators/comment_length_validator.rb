# frozen_string_literal: true

class CommentLengthValidator < ActiveModel::Validator
  MAX_CHARS = 1024

  def validate(comment)
    @comment = comment
    comment.errors.add(:text, "cannot be longer than #{MAX_CHARS} characters each") if too_long?
    comment.errors.add(:text, "cannot be post empty comment") if too_short?
  end

  private

  def too_short?
    countable_length == 0
  end

  def too_long?
    countable_length > MAX_CHARS
  end

  def countable_length
    countable_text.mb_chars.grapheme_length
  end

  def countable_text
    return '' if @comment.text.nil?

    @comment.text.dup.tap do |new_text|
      new_text.gsub!(FetchLinkCardService::URL_PATTERN, 'x' * 23)
      new_text.gsub!(Account::MENTION_RE, '@\2')
    end
  end
end
