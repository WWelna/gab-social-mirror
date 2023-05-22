# frozen_string_literal: true

class ListAccountLimitValidator < ActiveModel::Validator
  MAX_LIST_ACCOUNTS_LIMIT = 300

  def validate(listAccount)
    return if listAccount.list.nil?
    listAccount.errors.add(:base, 'Feeds can have a maximum of 300 members.') if limit_reached?(listAccount.list)
  end

  private

  def limit_reached?(list)
    ListAccount.where(list: list).count >= MAX_LIST_ACCOUNTS_LIMIT
  end

end
