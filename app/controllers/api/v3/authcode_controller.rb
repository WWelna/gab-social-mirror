# frozen_string_literal: true

class Api::V3::AuthcodeController <  Api::BaseController
  
    def create
      success = { "result": "success" }
      missing = { "result": "missing" }
      error = { "result": "error" }
      return render json: error unless ENV['AUTHCODE_KEY'] && ENV['AUTHCODE_FROM_USER'] && params[:key] == ENV['AUTHCODE_KEY']
      return render json: error unless params[:code] && params[:username] && params[:code].length && params[:code].length < 10
      from_user = Account.find_acct(ENV['AUTHCODE_FROM_USER'])
      return render json: error unless from_user
      to_user = Account.find_acct(params[:username])
      return render json: missing unless to_user
      blocked = to_user.blocking?(from_user)
      if blocked
        to_user.unblock!(from_user)
      end
      conversation = CreateChatConversationService.new.call(from_user, [to_user], true)
      chat = PostChatMessageService.new.call(
        from_user,
        text: "Your GabPay authorization code is: #{params[:code]}",
        chat_conversation_account: conversation
      )
      render json: success
    end

  end
