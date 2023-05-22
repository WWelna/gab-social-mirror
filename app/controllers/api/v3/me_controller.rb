# frozen_string_literal: true

class Api::V3::MeController <  Api::BaseController
  before_action :require_user!
  
  include ActionView::Helpers::CsrfHelper

  def index
    serializable_resource = ActiveModelSerializers::SerializableResource.new(MeStatePresenter.new(initial_state_params), serializer: MeStateSerializer)
    @initial_state_json = serializable_resource.to_json
    render json: @initial_state_json
  end

  private

  def initial_state_params
    if !current_user.nil? && !current_session.nil?
      {
        push_subscription: current_account.user.web_push_subscription(current_session),
        current_account: current_account,
        token: current_session.token,
        csrf:  csrf_tokens,
      }
    else
      return {}
    end
  end

  def csrf_tokens
    if protect_against_forgery?
      {
        csrf_param: request_forgery_protection_token,
        csrf_token: form_authenticity_token,
      }
    else
        {}
    end
  end

end


