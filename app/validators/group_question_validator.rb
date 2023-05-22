# frozen_string_literal: true

class GroupQuestionValidator < ActiveModel::Validator
  PER_GROUP_QUESTION_TOTAL_LIMIT = 25

  def validate(question)
    return if question.group.nil?
    question.errors.add(:base, "Group question limit reached. Max: #{PER_GROUP_QUESTION_TOTAL_LIMIT}") if limit_reached?(question.group)
    question.errors.add(:options, "Question description is too long. Max: 500") if question.description && question.description.mb_chars.grapheme_length > 500

    # done in model
    # question.errors.add(:options, "Question title is too long. Max: 120") if question.title && question.title.mb_chars.grapheme_length > 120
  end

  private

  def limit_reached?(group)
    group.group_questions.count >= PER_GROUP_QUESTION_TOTAL_LIMIT
  end
end
  