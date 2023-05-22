# frozen_string_literal: true

class ReactController < ApplicationController
  include Authorization

  before_action :authenticate_user!, only: [:react, :home]

  before_action :set_account, only: [:status_embed, :status_show, :account_show]
  before_action :set_status, only: [:status_embed, :status_show]
  before_action :check_account_suspension, only: [:status_embed, :status_show, :account_show]
  before_action :redirect_to_original, only: [:status_show]

  before_action :set_referrer_policy_header, only: [:react, :home, :status_embed, :status_show, :account_show]
  before_action :set_initial_state_json, only: [:react, :home, :status_embed, :status_show, :account_show]
  before_action :set_data_for_meta, only: [:react, :status_embed, :status_show, :account_show, :group_show]

  before_action :set_instance_presenter

  after_action :consider_recalculating, only: [:react]

  def react
    #
  end

  def groupBySlug
    @group = Group.where(slug: params[:groupSlug], is_archived: false).first
    unless @group.nil?
      return redirect_to "/groups/#{@group.id}"
    end

    return not_found
  end

  def feedBySlug
    # NOTE: at the moment, only an admin can create a list with a custom slug
    # and a list the uses a slug uses the singular version of GAB.COM/FEED/SLUG
    # instead of the plural version of GAB.COM/FEEDS/ID when using ids
    @list = List.where(slug: params[:listSlug]).public_only.first
    unless @list.nil?
      return redirect_to "/feeds/#{@list.id}"
    end

    return not_found
  end

  def status_show
    render 'react'
  end

  def status_embed
    # : todo :
  end

  def account_show
    render 'react'
  end

  private

  def set_account
    @account = Account.find_acct!(params[:username])
  end

  def set_status
    @status = @account.statuses.find(params[:statusId])
    if (@status.nil? || @status.proper.nil?)
      raise ActiveRecord::RecordNotFound
    end

    authorize @status, :show?
  rescue GabSocial::NotPermittedError
    # Reraise in order to get a 404
    raise ActiveRecord::RecordNotFound
  end

  def check_account_suspension
    gone if @account.suspended?
  end

  def redirect_to_original
    if @status.reblog?
      if !@status.proper.nil?
        redirect_to ::TagManager.instance.url_for(@status.reblog)
      else
        raise ActiveRecord::RecordNotFound
      end
    end
  end

  def set_data_for_meta
    return if find_route_matches && current_account

    if request.path.match(/^\/groups/)
      groupIdFromPath = request.path.sub("/groups", "").gsub("/", "")
      @group = Group.where(id: groupIdFromPath, is_archived: false).first
    elsif request.path.match(/^\/feeds/)
      listIdFromPath = request.path.sub("/feeds", "").gsub("/", "")
      @list = List.public_only.where(id: listIdFromPath).first
    elsif request.path.match(/^\/marketplace\/item/)
      listingIdFromPath = request.path.sub("/marketplace/item", "").gsub("/", "")
      @marketplace_listing = MarketplaceListing.only_running.where(id: listingIdFromPath).first
    elsif find_public_route_matches
      return
    elsif request.path.count("/") == 1 && request.path.length === 1
      #
    elsif request.path.count("/") == 1 && !request.path.include?("@")
      acctFromPath = request.path.sub("/", "")
      @account = Account.find_local!(acctFromPath)
    end
  end

  def authenticate_user!
    return if user_signed_in?
    if find_public_route_matches
      return
    elsif find_route_matches
      # if no current user, dont allow to navigate to these paths
      redirect_to(homepage_path)
    end

    return false
  end

  def find_route_matches
    request.path.match(/\A\/(home|news|api|deck|suggestions|links|chat_conversations|chat_conversation_accounts|messages|shortcuts|list|lists|notifications|tags|compose|follow_requests|admin|account|settings|filters|timeline|blocks|mutes|warnings)/)
  end

  def find_public_route_matches
    request.path.match(/\A\/(about|news|search|group|groups|explore|feeds|marketplace|timeline)/)
  end

  def set_initial_state_json
    serializable_resource = ActiveModelSerializers::SerializableResource.new(InitialStatePresenter.new(initial_state_params), serializer: InitialStateSerializer)
    @initial_state_json = serializable_resource.to_json
  end

  def initial_state_params
    if !current_user.nil? && !current_session.nil?
      {
        settings: Web::Setting.find_by(user: current_user)&.data || {},
        push_subscription: current_account.user.web_push_subscription(current_session),
        current_account: current_account,
        token: current_session.token,
      }
    else
      return {}
    end
  end

  def set_referrer_policy_header
    response.headers['Referrer-Policy'] = 'origin'
  end

  def set_instance_presenter
    @instance_presenter = InstancePresenter.new
  end

  def consider_recalculating
    if request.path.match(/^\/home/) || request.path.match(/^\//)
      return if current_account.nil?
      Rails.cache.fetch("recalc:#{Time.current.strftime('%Y%m%d')}:#{current_account.id}", expires_in: 1.day) do
        RecalculateAccountStatsWorker.perform_async(current_account.id)
        true
      end
    end
  end
end
