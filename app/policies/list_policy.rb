# frozen_string_literal: true

class ListPolicy < ApplicationPolicy

  def index?
    true
  end

  def show?
    is_list_owner? || is_public?
  end

  def update?
    is_list_owner?
  end

  def destroy?
    is_list_owner?
  end

  private

  def is_list_owner?
    record.account.id == current_account&.id
  end

  def is_public?
    record.public_visibility?
  end

end
