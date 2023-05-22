# frozen_string_literal: true

class Api::V1::Groups::QuestionAnswersController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_group

  def answer_all
    permit_params = params.permit(all_answers: [:answer, :question_id])

    questions = @group.group_questions
    
    is_removed = GroupRemovedAccount.where(group: @group, account_id: current_account.id).exists?
    if is_removed
      return render json: { error: true, message: 'You have been removed from this group. You cannot join again.' }, status: 422
    end

    if questions.empty?
      return render json: { error: true, message: 'There is no questions to answer.' }, status: 422
    end

    all_answers = params[:all_answers]
    if !all_answers.respond_to?(:map)
      return render json: { error: true, message: 'Must submit answers.' }, status: 422
    end
    
    # cycle all_answers and make sure we have the "answers" for each of the "questions" by q id
    submitted_answer_question_ids = all_answers.map do |a| 
      a[:question_id]
    end

    question_ids = questions.map(&:id)
    if submitted_answer_question_ids.sort != question_ids.sort
      return render json: { error: true, message: 'You must answer all the questions.' }, status: 422
    end

    has_unanswered_question = false
    has_long_answer = false
    clean_answers = all_answers.map do |a|
      answer = a[:answer]
      has_unanswered_question = true if answer.blank?
      has_long_answer = true if !answer.blank? && answer.length > 500

      {
        group_id: params[:group_id],
        group_question_id: a[:question_id],
        account_id: current_account.id,
        answer: ActionController::Base.helpers.strip_tags(answer),
      }
    end

    if has_unanswered_question
      return render json: { error: true, message: 'You must answer all the questions.' }, status: 422
    end
    # validated in model and should be in client too. but lets try to limit this #answer_all call to once time only
    # so we make the user correct all mistakes before doing the final `create()`
    if has_long_answer
      return render json: { error: true, message: 'All answers must be 500 characters or less.' }, status: 422
    end

    # create answers
    # will error out "account has already been taken"
    # if current_account already answered the questions
    # : todo : maybe allow updates to questions after submitting?
    @group.group_question_answers.create!(clean_answers)
    
    render_empty_success
  end

  def account_answers
    authorize @group, :allow_if_is_group_admin_or_moderator?

    answers = GroupQuestionAnswer.where(group: @group, account_id: params[:account_id])

    return render json: answers, each_serializer: REST::GroupQuestionAnswerSerializer
  end

  private

  def set_group
    @group = Group.find(params[:group_id])
  end

end
