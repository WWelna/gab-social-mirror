# frozen_string_literal: true

class REST::GroupQuestionAnswerSerializer < ActiveModel::Serializer
  attributes :id, :group_id, :account_id, :group_question_id, :answer, :created_at

  def id
    object.id.to_s
  end

  def group_id
    object.group_id.to_s
  end

  def account_id
    object.account_id.to_s
  end

  def group_question_id
    object.group_question_id.to_s
  end

end
