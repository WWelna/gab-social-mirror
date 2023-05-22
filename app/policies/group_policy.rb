# frozen_string_literal: true

class GroupPolicy < ApplicationPolicy
  def index?
    true
  end

  def create?
    true
  end

  def update?
    if staff?
      true
    else
      check_archive!
      is_group_admin?
    end
  end

  def destroy?
    if staff?
      true
    else
      check_archive!
      is_group_admin?
    end
  end

  def approve_status?
    check_archive!
    is_group_admin_or_moderator?
  end

  def destroy_status?
    check_archive!
    staff? || is_group_admin_or_moderator?
  end

  def join?
    check_archive!
    raise GabSocial::ValidationError, "Account is already a member of this group." if is_member?
    raise GabSocial::ValidationError, "Account is removed from this group." if is_removed?

    return true
  end

  def leave?
    check_archive!
    raise GabSocial::ValidationError, "Group member account not found." if not is_member?
    
    is_account_the_only_admin = (is_group_admin? and record.group_accounts.where(role: :admin).count == 1)
    raise GabSocial::ValidationError, "This is the last admin of this group." if is_account_the_only_admin

    return true
  end

  def allow_if_is_group_admin_or_moderator?
    staff? || is_group_admin_or_moderator?
  end

  private

  def is_removed?
    record.group_removed_accounts.where(account_id: current_account.id).exists?
  end

  def is_member?
    record.group_accounts.where(account_id: current_account.id).exists?
  end

  def is_group_admin?
    record.group_accounts.where(account_id: current_account.id, role: :admin).exists?
  end

  def is_group_admin_or_moderator?
    record.group_accounts.where(account_id: current_account.id, role: [:moderator, :admin]).exists?
  end

  def check_archive!
    raise GabSocial::ValidationError, "This group has been archived." if record.is_archived
  end
end
