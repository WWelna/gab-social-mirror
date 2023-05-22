# frozen_string_literal: true

class Api::V1::Groups::QuestionsController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_group
  before_action :set_question, only: [:update, :destroy]

  def index
    questions = @group.group_questions
    render json: questions, each_serializer: REST::GroupQuestionSerializer
  end

  def create
    authorize @group, :allow_if_is_group_admin_or_moderator?

    @question = @group.group_questions.create(question_params)
    render json: @question, serializer: REST::GroupQuestionSerializer
  end

  def update
    authorize @group, :allow_if_is_group_admin_or_moderator?

    if @question
      @question.update!(question_params)
      render json: @question, serializer: REST::GroupQuestionSerializer
    else 
      return render json: { error: 'Invalid question id' }, status: 404
    end
  end

  def destroy
    authorize @group, :allow_if_is_group_admin_or_moderator?

    if @question
      @question.destroy!
      render_empty_success
    else 
      return render json: { error: 'Invalid question id' }, status: 404
    end
  end

  private

  def set_question
    @question = @group.group_questions.find(params[:id])
  end

  def set_group
    @group = Group.find(params[:group_id])
  end

  def question_params
    params.permit(:title, :description, :index)
  end

end
