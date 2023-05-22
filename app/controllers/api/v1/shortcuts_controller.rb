# frozen_string_literal: true

class Api::V1::ShortcutsController < Api::BaseController
  before_action :require_user!

  def index
    @shortcuts = Shortcut.where(account: current_account).limit(100)

    @onlyGroupIds = @shortcuts.select{ |s| s.shortcut_type == 'group' }.map(&:shortcut_id)
    @onlyAccountIds = @shortcuts.select{ |s| s.shortcut_type == 'account' }.map(&:shortcut_id)
    @onlyListIds = @shortcuts.select{ |s| s.shortcut_type == 'list' }.map(&:shortcut_id)
    @onlyTagIds = @shortcuts.select{ |s| s.shortcut_type == 'tag' }.map(&:shortcut_id)

    @groups = Group.where(id: @onlyGroupIds, is_archived: false).limit(100)
    @accounts = Account.where(id: @onlyAccountIds).without_suspended.limit(100)
    @lists = List.where(id: @onlyListIds).public_only.limit(100)
    @tags = Tag.where(id: @onlyTagIds).limit(100)

    @final = @shortcuts.map do |s|
      value = nil
      title = nil
      to = nil
      image = nil

      if s.shortcut_type == 'group'
        @group = @groups.detect{ |g| g.id == s.shortcut_id }
        if @group.nil?
          ActiveRecord::Base.connected_to(role: :writing) do
            s.destroy!
          end
        else
          value = REST::GroupSerializer.new(@group)
        end
      elsif s.shortcut_type == 'account'
        @account = @accounts.detect{ |a| a.id == s.shortcut_id }
        if @account.nil?
          ActiveRecord::Base.connected_to(role: :writing) do
            s.destroy!
          end
        else
          value = REST::AccountSerializer.new(@account)
        end
      elsif s.shortcut_type == 'list'
        @list = @lists.detect{ |a| a.id == s.shortcut_id }
        if @list.nil?
          ActiveRecord::Base.connected_to(role: :writing) do
            s.destroy!
          end
        else
          value = REST::ListSerializer.new(@list)
        end
      elsif s.shortcut_type == 'tag'
        @tag = @tags.detect{ |a| a.id == s.shortcut_id }
        if @tag.nil?
          ActiveRecord::Base.connected_to(role: :writing) do
            s.destroy!
          end
        else
          value = REST::TagSerializer.new(@tag)
        end
      end

      r = {
        id: s.id,
        created_at: s.created_at,
        shortcut_id: s.shortcut_id,
        shortcut_type: s.shortcut_type,
        unread_count: s.unread_count,
        shortcut: value,
      }
      r
    end

    render json: @final
  end

  def show
    shortcut = shortcut_by_type
    if shortcut.nil?
      render json: { error: 'Not found' }, status: 404
    else
      render json: shortcut, serializer: REST::ShortcutSerializer
    end
  end

  def create
    shortcut_type = params[:shortcut_type]
    shortcut_id = params[:shortcut_id]
    value = nil
    tag = nil

    if shortcut_type == 'group'
      group = Group.where(id: shortcut_id, is_archived: false).first
      value = REST::GroupSerializer.new(group) if !group.nil?
    elsif shortcut_type == 'account'
      account = Account.where(id: shortcut_id).without_suspended.first
      value = REST::AccountSerializer.new(account) if !account.nil?
    elsif shortcut_type == 'list'
      list = List.where(id: shortcut_id).public_only.first
      value = REST::ListSerializer.new(list) if !list.nil?
    elsif shortcut_type == 'tag'
      # find tag by name instead of id since we send up the tag (i.e. "testhashtag")
      tag = Tag.where(name: shortcut_id).first
      # : todo : if not found, create it
      value = REST::TagSerializer.new(tag) if !tag.nil?
    end

    if value.nil?
      raise GabSocial::NotPermittedError, 'Invalid shortcut.'
    end

    shortcut = Shortcut.create!(
      account: current_account,
      shortcut_type: shortcut_type,
      shortcut_id: shortcut_type == 'tag' ? tag.id : shortcut_id,
    )
    
    r = {
      id: shortcut.id,
      created_at: shortcut.created_at,
      shortcut_id: shortcut.shortcut_id,
      shortcut_type: shortcut.shortcut_type,
      shortcut: value,
    }

    render json: r

  rescue ActiveRecord::RecordNotUnique
    render json: { error: I18n.t('shortcuts.errors.exists') }, status: 422
  end

  def destroy
    shortcut = shortcut_by_id
    if shortcut.nil?
      render json: { error: 'Not found' }, status: 404
    else
      shortcut.destroy!
      render json: { error: false, id: params[:id] }
    end
  end

  def clear_count
    shortcut = shortcut_by_id
    if shortcut.nil?
      render json: { error: 'Not found' }, status: 404
    else
      shortcut.update!(unread_count: 0)
      render_empty_success
    end
  end

  private

  def shortcut_by_id
    Shortcut.where(account: current_account).find(params[:id])
  end

  def shortcut_by_type
    # if type is "tag" find tag's id
    the_id = params[:id]
    the_type = params[:type]

    if the_type == 'tag'
      tag = Tag.where(name: the_id.to_s.downcase).first
      return nil if tag.nil?
      the_id = tag.id
    end

    Shortcut.where(
      account: current_account,
      shortcut_id: the_id,
      shortcut_type: the_type,
    ).limit(1).first
  end

  def shortcut_params
    params.permit(:shortcut_type, :shortcut_id)
  end
end
