# frozen_string_literal: true

class MeStatePresenter < ActiveModelSerializers::Model
  attributes :push_subscription, :token,
             :current_account, :text, :csrf
end
