# frozen_string_literal: true

class REST::V3::SearchSerializer < ActiveModel::Serializer
  has_many :accounts, serializer: REST::AccountSerializer, if: -> { object.accounts.present? }
  has_many :statuses, serializer: REST::StatusSerializer, if: -> { object.statuses.present? }
  has_many :groups, serializer: REST::GroupSerializer, if: -> { object.groups.present? }
  has_many :links, serializer: REST::PreviewCardSerializer, if: -> { object.links.present? }
  has_many :lists, serializer: REST::ListSerializer, if: -> { object.lists.present? }
  has_many :hashtags, serializer: REST::TagSerializer, if: -> { object.hashtags.present? }
end
