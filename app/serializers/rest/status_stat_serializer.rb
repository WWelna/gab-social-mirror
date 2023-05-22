# frozen_string_literal: true

class REST::StatusStatSerializer < ActiveModel::Serializer
  attributes :status_id, :replies_count, :reblogs_count, :favourites_count, :reaction_id, :reactions_counts

  attribute :favourited, if: :current_user?
  attribute :reblogged, if: :current_user?

  def status_id
    object.id.to_s
  end

  def favourited
    if instance_options && instance_options[:relationships]
      !!instance_options[:relationships].favourites_map[object.id] || false
    else
      current_user.account.favourited?(object)
    end
  end

  def reactions_counts
    object.reactions_counts
  end

  def reaction_id
    if instance_options && instance_options[:relationships]
      instance_options[:relationships].favourites_map[object.id] || nil
    else
      current_user.account.reaction_id(object)
    end
  end
  
  def favourites_count
    object.favourites_count
  end

  def reblogged
    if instance_options && instance_options[:relationships]
      instance_options[:relationships].reblogs_map[object.id] || false
    else
      current_user.account.reblogged?(object)
    end
  end

  def reblogs_count
    if instance_options && instance_options[:unreblog]
      object.reblogs_count - 1
    else
      object.reblogs_count
    end
  end

  def current_user?
    !current_user.nil?
  end

  private

  def favourite
    current_user.account.favourited?(object)
  end

end
