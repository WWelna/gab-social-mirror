# frozen_string_literal: true

class REST::AccountSerializer < ActiveModel::Serializer
  include RoutingHelper

  attributes :id, :username, :acct, :display_name, :locked, :bot, :created_at,
             :note, :url, :avatar, :avatar_static, :avatar_small, :avatar_static_small, :header, :header_static, :is_spam,
             :followers_count, :following_count, :statuses_count, :is_pro, :is_verified,
             :is_donor, :is_investor, :show_pro_life, :is_parody

  has_one :moved_to_account, key: :moved, serializer: REST::AccountSerializer, if: :moved_and_not_nested?
  has_many :emojis, serializer: REST::CustomEmojiSerializer

  class FieldSerializer < ActiveModel::Serializer
    attributes :name, :value, :verified_at

    def value
      Formatter.instance.format_field(object.account, object.value)
    end
  end

  has_many :fields

  def id
    object.id.to_s
  end

  def is_spam
    object.is_spam?
  end

  def show_pro_life
    object.is_pro_life? && object.show_pro_life?
  end

  def note
    Formatter.instance.simplified_format(object)
  end

  def url
    TagManager.instance.url_for(object)
  end

  def avatar
    AccountAsset.new(object).avatar_url
  end

  def avatar_small
    AccountAsset.new(object).avatar_url(width: 92)
  end

  def avatar_static
    AccountAsset.new(object).avatar_static_url
  end

  def avatar_static_small
    AccountAsset.new(object).avatar_static_url(width: 92)
  end

  def header
    AccountAsset.new(object).header_url
  end

  def header_static
    AccountAsset.new(object).header_static_url
  end

  def moved_and_not_nested?
    object.moved? && object.moved_to_account.moved_to_account_id.nil?
  end
end
