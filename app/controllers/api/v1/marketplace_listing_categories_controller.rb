# frozen_string_literal: true

class Api::V1::MarketplaceListingCategoriesController < EmptyController

  def index
    data = ActiveModelSerializers::SerializableResource.new(MarketplaceListingCategory.alphabetical.all, each_serializer: REST::MarketplaceListingCategorySerializer)
    render json: data.to_json, content_type: 'application/json'
  end

end
