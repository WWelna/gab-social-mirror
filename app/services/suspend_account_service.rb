# frozen_string_literal: true

#    conversations
#chat_block_relationships
#chat_blocked_by_relationships
#chat_conversations
#chat_messages
#subscriptions
#group_accounts
#group_join_requests
#group_removed_accounts
#shortcuts

class SuspendAccountService < BaseService
  ASSOCIATIONS_ON_SUSPEND = %w(
    active_relationships
    block_relationships
    blocked_by_relationships
    custom_filters
    favourites
    follow_requests
    list_accounts
    marketplace_listings
    media_attachments
    mute_relationships
    muted_by_relationships
    notifications
    owned_lists
    passive_relationships
    report_notes
    scheduled_statuses
    status_bookmarks
    status_pins
  ).freeze

  ASSOCIATIONS_ON_DESTROY = %w(
    reports
    targeted_moderation_notes
    targeted_reports
  ).freeze

  # Suspend an account and remove as much of its data as possible
  # @param [Account]
  # @param [Hash] options
  # @option [Boolean] :including_user Remove the user record as well
  # @option [Boolean] :destroy Remove the account record instead of suspending
  def call(account, **options)
    @account = account
    return true if @account.is_pro? || @account.is_verified? || @account.is_donor? || @account.is_investor?
    @options = options

    purge_user!
    purge_profile!
    purge_content!
    resolve_reports!
  end

  private

  def purge_user!
    return if !@account.local? || @account.user.nil?

    if @options[:including_user]
      @account.user.destroy
    else
      @account.user.disable!
    end
  end

  def purge_content!
    gmes = GroupModerationEvent.where(account_id: @account.id).where(acted_at: nil)
    gmes.update_all(acted_at: Time.now, rejected: true)
    gms = GroupModerationStatus.where(account_id: @account.id)
    gms.destroy_all
    @account.statuses.reorder(nil).find_in_batches do |statuses|
      BatchedRemoveStatusService.new.call(statuses, @account, skip_side_effects: @options[:destroy])
    end

    associations_for_destruction.each do |association_name|
      destroy_all(@account.public_send(association_name))
    end

    @account.destroy if @options[:destroy]
  end

  def purge_profile!
    # If the account is going to be destroyed
    # there is no point wasting time updating
    # its values first

    return if @options[:destroy]

    @account.silenced_at      = nil
    @account.suspended_at     = @options[:suspended_at] || Time.now.utc
    @account.locked           = false
    @account.display_name     = ''
    @account.note             = ''
    @account.fields           = []
    @account.statuses_count   = 0
    @account.followers_count  = 0
    @account.following_count  = 0
    @account.moved_to_account = nil
    @account.avatar.destroy
    @account.header.destroy
    @account.save!
  end

  def resolve_reports!
    Report.where(target_account: @account).unresolved.update_all(action_taken: true) unless @options[:destroy]
  end

  def destroy_all(association)
    association.in_batches.destroy_all
  end

  def associations_for_destruction
    if @options[:destroy]
      ASSOCIATIONS_ON_SUSPEND + ASSOCIATIONS_ON_DESTROY
    else
      ASSOCIATIONS_ON_SUSPEND
    end
  end
end
