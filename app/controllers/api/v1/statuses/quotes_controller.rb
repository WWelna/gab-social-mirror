# frozen_string_literal: true

class Api::V1::Statuses::QuotesController < Api::BaseController
    include Authorization
  
    before_action :set_status
    after_action :insert_pagination_headers
  
    def index
      @quotes = load_quotes
      render json: @quotes, each_serializer: REST::StatusSerializer
    end
  
    private
  
    def load_quotes
      Status.where(quote_of_id: @status.id).where(tombstoned_at: nil)
      .where.not(account_id: @status.account.excluded_from_timeline_account_ids)
      .paginate_by_id(
        limit_param(DEFAULT_COMMENTS_LIMIT),
        params_slice(:max_id, :since_id, :min_id)
      )
      .to_a
    end
    
    def insert_pagination_headers
      set_pagination_headers(next_path, prev_path)
    end
  
    def next_path
      if records_continue?
        api_v1_status_quotes_url pagination_params(max_id: pagination_max_id)
      end
    end
  
    def prev_path
      unless @quotes.empty?
        api_v1_status_quotes_url pagination_params(since_id: pagination_since_id)
      end
    end
  
    def pagination_max_id
      @quotes.last.id
    end
  
    def pagination_since_id
      @quotes.first.id
    end
  
    def records_continue?
      @quotes.size == limit_param(DEFAULT_COMMENTS_LIMIT)
    end
  
    def set_status
      @status = Status.find(params[:status_id])
      authorize @status, :show?
    rescue GabSocial::NotPermittedError
      raise ActiveRecord::RecordNotFound
    end
  
    def pagination_params(core_params)
      params.slice(:limit).permit(:limit).merge(core_params)
    end
  
  end
  