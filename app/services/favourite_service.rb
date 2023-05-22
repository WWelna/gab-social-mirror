# frozen_string_literal: true

class FavouriteService < BaseService
  include Authorization

  # Favourite a status and notify remote user
  # @param [Account] account
  # @param [Status] status
  # @param [Integer] reactionId (optional) [default:nil] 
  # @return [Favourite]
  def call(account, status, reactionId = nil)
    if !status.nil? && status.account.blocking?(account)
      raise GabSocial::NotPermittedError, "Cannot like or react. @#{status.account.username} has you blocked."
    end

    if !status.group.nil? && status.group.is_private
      group_relationships = GroupRelationshipsPresenter.new([status.group.id], account.id)
      is_admin_or_mod = group_relationships.admin[status.group.id] == true or group_relationships.moderator[status.group.id] == true
      is_member = group_relationships.member[status.group.id] == true
      if !is_admin_or_mod && !is_member
        raise GabSocial::NotPermittedError, "Cannot like or react. You are not a member of this private group."
      end
    end
    
    if !reactionId.nil?
      reactionType = ReactionType.active.where(id: reactionId).first
      if reactionType.nil?
        raise GabSocial::NotPermittedError, "That reaction is not active"
      end
    end

    favourite = begin
      favourite = Favourite.find_by(account: account, status: status)
      if favourite.nil?
        favourite = Favourite.create!(account: account, status: status, reaction_id: reactionId)
      else
        if favourite.reaction_id != reactionId
          favourite.update!(reaction_id: reactionId)
        end
      end
      favourite
      # old:
      # Favourite.find_or_create_by!(account: account, status: status)
    rescue ActiveRecord::RecordNotUnique
      # Race conditions...
      favourite = Favourite.find_by!(account: account, status: status)
      if favourite.reaction_id != reactionId
        favourite.update!(reaction_id: reactionId)
      end
      favourite
      # old:
      # return Favourite.find_by!(account: account, status: status)
    end

    create_notification(favourite)

    clear_reaction_cache(status)

    favourite
  end

  private

  def clear_reaction_cache(status)
    Rails.cache.delete("reactions_counts:#{status.id}")
    Rails.cache.delete("statuses/#{status.id}")
  end

  def create_notification(favourite)
    status = favourite.status

    NotifyService.new.call(status.account, favourite)
  end

end
