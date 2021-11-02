# frozen_string_literal: true

class PreviewCardFilter
  attr_reader :params

  def initialize(params)
    @params = params
  end

  def results
    scope = PreviewCard
    params.each do |key, value|
      scope = scope.merge scope_for(key, value)
    end
    scope
  end

  def scope_for(key, value)
    case key.to_sym
    when :title
      PreviewCard.matching(:title, :contains, value)
    when :description
      PreviewCard.matching(:description, :contains, value)
    when :url
      PreviewCard.matching(:url, :contains, value)
    else
      raise "Unknown filter: #{key}"
    end
  end
end
