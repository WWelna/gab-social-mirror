# frozen_string_literal: true

module Authorization
  extend ActiveSupport::Concern

  USER_FRIENDLY_WORDS = {
    'favourite' => 'like',
    'reblog' => 'repost',
    'destroy' => 'delete',
    'index' => 'view',
    'show' => 'view',
    'create' => 'submit',
    'update' => 'edit',
    'not allowed to' => 'cannot',
  }.freeze

  include Pundit

  def pundit_user
    current_account
  end

  def authorize(*)
    super
  rescue Pundit::NotAuthorizedError => e
    raise GabSocial::NotPermittedError, format_error(e)
  end

  def authorize_with(user, record, query)
    Pundit.authorize(user, record, query)
  rescue Pundit::NotAuthorizedError => e
    raise GabSocial::NotPermittedError, format_error(e)
  end

private
  def format_error(error)
    USER_FRIENDLY_WORDS.inject(error.to_s) { |str, (before, after)| str.gsub(before, after) }.
      gsub('?', '').
      capitalize
  end
end
