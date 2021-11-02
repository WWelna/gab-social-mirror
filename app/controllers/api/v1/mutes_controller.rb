# frozen_string_literal: true

class Api::V1::MutesController < Api::BaseController
  before_action -> { doorkeeper_authorize! :follow, :'read:mutes' }
  before_action :require_user!

  def index
    @accounts = load_accounts
    render json: @accounts, each_serializer: REST::AccountSerializer
  end

  private

  def load_accounts
    all_mutes.map(&:target_account)
  end

  def all_mutes
    @all_mutes ||= Mute.eager_load(:target_account)
                    .where(account: current_account)
  end

end
