# frozen_string_literal: true

module ListInteractions
  extend ActiveSupport::Concern

  class_methods do

    def member_map(target_list_ids, account_id)
      follow_mapping(ListAccount.where(list_id: target_list_ids, account_id: account_id), :list_id)
    end

    def subscriber_map(target_list_ids, account_id)
      follow_mapping(ListSubscriber.where(list_id: target_list_ids, account_id: account_id), :list_id)
    end

    private

    def follow_mapping(query, field)
      query.pluck(field).each_with_object({}) { |id, mapping| mapping[id] = true }
    end

  end

end
