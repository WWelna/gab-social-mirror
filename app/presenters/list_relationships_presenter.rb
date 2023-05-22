# frozen_string_literal: true

class ListRelationshipsPresenter
  attr_reader :member, :subscriber, :owner

  def initialize(list_ids, current_account_id, **options)    
    @list_ids          = list_ids.map { |a| a.is_a?(List) ? a.id : a }
    @current_account_id = current_account_id

    if (@current_account_id.nil? || @list_ids.empty?)
      @member = {}
      @subscriber = {}
    else
      @member = List.member_map(@list_ids, @current_account_id)
      @subscriber = List.subscriber_map(@list_ids, @current_account_id)
    end
  end
end
