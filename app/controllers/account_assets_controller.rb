# frozen_string_literal: true

class AccountAssetsController < EmptyController
  before_action :find_account

  def avatar
    redirect_to AccountAsset.new(@account).avatar_url
  end

private
  def find_account
    @account = Account.find_acct(params[:username]) if Account::USERNAME_RE.match?(params[:username])
    @account ||= Account.new # Return the fallback image if the account wasn't found. Don't 404.
  end

end
