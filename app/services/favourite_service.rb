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

    new_record = true
    has_change = false

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
        has_change = true
      else
        new_record = false
        if favourite.reaction_id != reactionId
          favourite.update!(reaction_id: reactionId)
          has_change = true
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

    check_top_two_reactions(status, favourite, new_record)

    create_notification(favourite) if has_change

    favourite
  end

  private

  def check_top_two_reactions(status, favourite, new_record)
    top2 = status.status_stat.top_reactions
    if top2.nil?
      count_and_update_top_two_reactions(status)
    else
      top2 = top2.split(',')
      if favourite.reaction_id.to_s != top2[0] || !new_record
        count_and_update_top_two_reactions(status)
      end
    end
  end

  def count_and_update_top_two_reactions(status)
    rmap = Status.reactions_map(status.id)
    top2 = rmap.sort_by { |id, count| count }.reverse
    top2 = top2[0..1].map { |id, count| id }.join(',')
    status.status_stat.update!(top_reactions: top2)
  end

  def create_notification(favourite)
    status = favourite.status

    NotifyService.new.call(status.account, favourite)
  end

end
