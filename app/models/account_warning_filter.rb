# frozen_string_literal: true

class AccountWarningFilter
  attr_reader :params

  def initialize(params)
    @params = params
  end

  def results
    scope = AccountWarning.latest
    params.each do |key, value|
      scope = scope.merge scope_for(key, value) if !value.nil? && !value.empty?
    end
    scope
  end

  def scope_for(key, value)
    case key.to_sym
    when :id
      AccountWarning.where(id: value)
    when :text
      AccountWarning.matching(:text, :contains, value)
    # when :action
    #   AccountWarning.where(action: value)
    when :target_account_id
      AccountWarning.where(target_account_id: value)
    else
      raise "Unknown filter: #{key}"
    end
  end
end
