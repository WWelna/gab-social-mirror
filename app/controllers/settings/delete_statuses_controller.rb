# frozen_string_literal: true

class Settings::DeleteStatusesController < Settings::BaseController
  layout 'admin'

  before_action :authenticate_user!

  def show
    @confirmation = Form::DeleteStatusesConfirmation.new
  end

  def destroy
    if current_user.valid_password?(delete_params[:password])
      PurgeAccountStatusesWorker.perform_async(current_user.account_id, Time.now)
      redirect_to settings_statuses_path, notice: 'All of your statuses are queued to be deleted. Please be patient, this may take a few minutes.'
    else
      redirect_to settings_delete_statuses_path, alert: 'Unable to delete all statuses, please try again.'
    end
  end

  private

  def delete_params
    params.require(:form_delete_statuses_confirmation).permit(:password)
  end
end
