# frozen_string_literal: true

class GroupRelationshipsPresenter
  attr_reader :member, :admin, :moderator, :requested

  def initialize(group_ids, current_account_id, **options)
    @group_ids          = group_ids.map { |a| a.is_a?(Group) ? a.id : a }
    @current_account_id = current_account_id

    if (@current_account_id.nil? || @group_ids.empty?)
      @member = {}
      @admin = {}
      @moderator = {}
      @requested = {}
    else
      @member = Group.member_map(@group_ids, @current_account_id)
      @admin = Group.admin_map(@group_ids, @current_account_id)
      @moderator = Group.moderator_map(@group_ids, @current_account_id)
      @requested = Group.requested_map(@group_ids, @current_account_id)
    end
  end
end
