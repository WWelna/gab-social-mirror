# frozen_string_literal: true

module Admin
  class ActionLogsController < BaseController
    def index
      if params[:target_id]
        @action_logs = Admin::ActionLog.where(target_id: params[:target_id]).page(params[:page])
      else 
        @action_logs = Admin::ActionLog.page(params[:page])
      end
    end
  end
end
