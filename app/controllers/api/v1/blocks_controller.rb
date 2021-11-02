# frozen_string_literal: true

class Api::V1::BlocksController < Api::BaseController
  before_action -> { doorkeeper_authorize! :follow, :'read:blocks' }
  before_action :require_user!

  def index
    @accounts = load_accounts
    render json: @accounts, each_serializer: REST::AccountSerializer
  end

  private

  def load_accounts
    all_blocks.map(&:target_account)
  end

  def all_blocks
    @all_blocks ||= Block.eager_load(target_account: :account_stat)
                      .where(account: current_account)
  end

end
