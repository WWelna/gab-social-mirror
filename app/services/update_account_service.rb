# frozen_string_literal: true

class UpdateAccountService < BaseService
  def call(account, params, raise_error: false)
    was_locked    = account.locked
    old_username  = account.username
    update_method = raise_error ? :update! : :update

    note = params[:note]
    if !note.nil? && LinkBlock.block?(note)
      account.errors.add(:note, "Unable to update information")
      return false
    end

    # Check if can change username, or hit the 1 per day limit
    if !params[:username].nil? && old_username != params[:username]
      max_username_change_daily_limit = 1
      has_changed_username_recently = AccountUsernameChange.where(account: account).where('created_at > ?', 1.day.ago).count >= max_username_change_daily_limit

      if has_changed_username_recently
        account.errors.add(:username, "Daily username change limit of 1 is reached. Please wait 24 hours to change it again")
        return false
      end
    end


    account.send(update_method, params).tap do |ret|
      next unless ret

      authorize_all_follow_requests(account) if was_locked && !account.locked
      create_account_username_change(old_username, account.username, account) if old_username != account.username

      process_hashtags(account)
    end
  rescue GabSocial::DimensionsValidationError => de
    account.errors.add(:avatar, de.message)
    false
  end

  private

  def create_account_username_change(old_username, new_username, account)
    AccountUsernameChange.create!(
      account: account,
      from_username: old_username || '',
      to_username: new_username || ''
    )
  end

  def authorize_all_follow_requests(account)
    AuthorizeFollowWorker.push_bulk(FollowRequest.where(target_account: account).select(:account_id, :target_account_id)) do |req|
      [req.account_id, req.target_account_id]
    end
  end

  def process_hashtags(account)
    account.tags_as_strings = Extractor.extract_hashtags(account.note)
  end
end
