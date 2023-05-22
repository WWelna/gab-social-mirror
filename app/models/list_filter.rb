# frozen_string_literal: true

class ListFilter
  attr_reader :params

  def initialize(params)
    @params = params
  end

  def results
    scope = List
    params.each do |key, value|
      scope = scope.merge scope_for(key, value) if !value.nil? && !value.empty?
    end
    scope
  end

  def scope_for(key, value)
    case key.to_sym
    when :id
      List.where(id: value)
    when :title
      List.matching(:title, :contains, value)
    when :slug
      List.matching(:slug, :contains, value)
    when :is_featured
      List.where(is_featured: true)
    else
      raise "Unknown filter: #{key}"
    end
  end
end
