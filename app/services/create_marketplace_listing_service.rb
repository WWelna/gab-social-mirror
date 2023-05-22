class CreateMarketplaceListingService < BaseService

  # create or edit
  def call(account, options = {}, existing_marketplace_listing = nil)
    @account     = account
    @options     = options
    @description = @options[:description] || ''
    @tags = (@options[:tags] || []).reject(&:blank?).uniq
    @existing_marketplace_listing = existing_marketplace_listing

    validate_status!
    validate_attributes!
    validate_links! unless @account.user&.staff?
    validate_media!
    validate_user_confirmation! unless !@existing_marketplace_listing.nil? || @account.user&.staff?

    process_marketplace_listing!

    if existing_marketplace_listing.nil?
      @marketplace_listing
    else
      existing_marketplace_listing
    end
  end

  private

  def validate_status!
    # if not editing, return
    return true if @existing_marketplace_listing.nil?

    # can NOT edit if status is sold, archived, expired, rejected
    if @existing_marketplace_listing.status.to_sym == :sold
      raise GabSocial::NotPermittedError, "You cannot edit a listing marked as Sold."
      return false
    elsif @existing_marketplace_listing.status.to_sym == :archived
      raise GabSocial::NotPermittedError, "You cannot edit an archived listing."
      return false
    elsif @existing_marketplace_listing.status.to_sym == :expired
      raise GabSocial::NotPermittedError, "You cannot edit an expired listing."
      return false
    elsif @existing_marketplace_listing.status.to_sym == :rejected
      raise GabSocial::NotPermittedError, "You cannot edit a rejected listing."
      return false
    end

    true
  end

  def validate_attributes!
    if @options[:title].nil? || @options[:title].length === 0
      raise GabSocial::NotPermittedError, "You must include a title"
    end
    if @description.nil? || @description.length === 0
      raise GabSocial::NotPermittedError, "You must add a description"
    end
    if @options[:price].to_f < 0
      raise GabSocial::NotPermittedError, "You must enter a valid price"
    end
    if @options[:marketplace_listing_category_id].nil?
      raise GabSocial::NotPermittedError, "You must select a category."
    end

    true
  end

  def validate_links!
    return true unless LinkBlock.block?(@text)
    raise GabSocial::NotPermittedError, "A link you included in your Marketplace listing has been flagged as spam, if you believe this is a mistake please contact support@gab.com and let us know."
  end

  def validate_media!
    max_media_limit = 8

    # check if edit or create
    if !@existing_marketplace_listing.nil?
      # is editing...
      # get attached AND unattached
      @media = @account.media_attachments.where(id: @options[:media_ids].take(max_media_limit).map(&:to_i))
    else
      return if @options[:media_ids].blank? || !@options[:media_ids].is_a?(Enumerable)
      # is creating...
      # get ONLY unattached
      @media = @account.media_attachments.unattached.where(id: @options[:media_ids].take(max_media_limit).map(&:to_i))
    end

    raise GabSocial::ValidationError, I18n.t('media_attachments.validations.too_many') if @media.count > max_media_limit
  end

  def process_marketplace_listing!
    # The following transaction block is needed to wrap the UPDATEs to
    # the media attachments when the status is created
    ApplicationRecord.transaction do  
      # check if edit or create
      if @existing_marketplace_listing.nil?
        @marketplace_listing = @account.marketplace_listings.create!(marketplace_listing_attributes)
      else
        @existing_marketplace_listing.update!(marketplace_listing_attributes)
      end
    end
  end

  def validate_user_confirmation!
    return true if @account.user&.confirmed?
    raise GabSocial::NotPermittedError, "Please confirm your account before creating a Marketplace listing."
  end

  def marketplace_listing_attributes
    {
      title: @options[:title],
      description: @description,
      tags: @tags || [],
      location: @options[:location],
      condition: @options[:condition],
      price: @options[:price],
      account_id: @account.id,
      media_attachments: @media || [],
      marketplace_listing_category_id: @options[:marketplace_listing_category_id],
      is_shipping_required: ActiveModel::Type::Boolean.new.cast(@options[:is_shipping_required])
    }.compact
  end


end