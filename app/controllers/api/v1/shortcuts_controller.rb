# frozen_string_literal: true

class Api::V1::ShortcutsController < Api::BaseController
  before_action :require_user!
  before_action :set_shortcut, except: [:index, :create]

  def index
    @shortcuts = Shortcut.where(account: current_account).limit(100)

    @onlyGroupIds = @shortcuts.select{ |s| s.shortcut_type == 'group' }.map(&:shortcut_id)
    @onlyAccountIds = @shortcuts.select{ |s| s.shortcut_type == 'account' }.map(&:shortcut_id)
    @onlyListIds = @shortcuts.select{ |s| s.shortcut_type == 'list' }.map(&:shortcut_id)

    @groups = Group.where(id: @onlyGroupIds, is_archived: false).limit(100)
    @accounts = Account.where(id: @onlyAccountIds).without_suspended.limit(100)
    @lists = List.where(id: @onlyListIds).public_only.limit(100)

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
      end

      r = {
        id: s.id,
        created_at: s.created_at,
        shortcut_id: s.shortcut_id,
        shortcut_type: s.shortcut_type,
        shortcut: value,
      }
      r
    end

    render json: @final
  end

  def show
    render json: @shortcut, serializer: REST::ShortcutSerializer
  end

  def create
    @shortcut = Shortcut.new(shortcut_params.merge(account: current_account))

    value = case @shortcut.shortcut_type
    when 'group'
      group = Group.where(is_archived: false).find(@shortcut.shortcut_id)
      REST::GroupSerializer.new(group)
    when 'account'
      account = Account.without_suspended.find(@shortcut.shortcut_id)
      REST::AccountSerializer.new(account)
    when 'list'
      list = List.public_only.or(List.where(account: current_account)).find(@shortcut.shortcut_id)
      REST::ListSerializer.new(list)
    else
      raise GabSocial::ValidationError, "#{@shortcut.shortcut_type} is not a valid shortcut type"
    end

    @shortcut.save!

    render json: {
      id: @shortcut.id,
      created_at: @shortcut.created_at,
      shortcut_type: @shortcut.shortcut_type,
      shortcut_id: @shortcut.shortcut_id,
      shortcut: value,
    }

  rescue ActiveRecord::RecordNotUnique
    render json: { error: I18n.t('shortcuts.errors.exists') }, status: 422
  end

  def destroy
    @shortcut.destroy!
    render json: { error: false, id: params[:id] }
  end

  private

  def set_shortcut
    @shortcut = Shortcut.where(account: current_account).find(params[:id])
  end

  def shortcut_params
    params.permit(:shortcut_type, :shortcut_id)
  end
end
