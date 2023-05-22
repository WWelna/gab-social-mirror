# frozen_string_literal: true

class Api::V1::Groups::RulesController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_group

  def create
    authorize @group, :allow_if_is_group_admin_or_moderator?

    @group.update!(rules: clean_rules)
    render json: @group, serializer: REST::GroupSerializer
  end

  def destroy
    authorize @group, :allow_if_is_group_admin_or_moderator?

    @group.update!(rules: nil)
    render json: @group, serializer: REST::GroupSerializer 
  end

  private

  def set_group
    @group = Group.find(params[:group_id])
  end

  def clean_rules
    permit_params = params.permit(rules: [:title, :description])
    
    rules = permit_params[:rules]
    return nil if !rules.respond_to?(:map)
    
    cr = rules.map do |r|
      {
        title: ActionController::Base.helpers.strip_tags(r[:title]),
        description: ActionController::Base.helpers.strip_tags(r[:description]),
      }
    end

    cr
  end

end
