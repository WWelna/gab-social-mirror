# frozen_string_literal: true

class Api::V3::AuthcodeController <  Api::BaseController
  
    def create
      missing = { "result": "missing" }
      suspended = { "result": "suspended" }
      error = { "result": "error" }
      return render json: error unless ENV['AUTHCODE_KEY'] && ENV['AUTHCODE_FROM_USER'] && params[:key] == ENV['AUTHCODE_KEY']
      return render json: error unless params[:email] || params[:username]
      return render json: error unless params[:code] || params[:message]
      if params[:code]
        return render json: error unless params[:code].length && params[:code].length < 10
        params[:message] = "Your GabPay authorization code is: #{params[:code]}"
      end
      from_user = Account.find_acct(ENV['AUTHCODE_FROM_USER'])
      return render json: error unless from_user
      to_user = nil
      if params[:email]
        target_email = EmailAddress::Address.new(params[:email]).canonical
        to_user = User.find_by(email: target_email)
        return render json: missing unless to_user && to_user.account
        to_user = to_user.account
      elsif params[:username]
        to_user = Account.find_acct(params[:username])
        return render json: missing unless to_user
      end
      return render json: suspended if to_user.suspended?
      blocked = to_user.blocking?(from_user)
      if blocked
        to_user.unblock!(from_user)
      end
      conversation = CreateChatConversationService.new.call(from_user, [to_user], true)
      chat = PostChatMessageService.new.call(
        from_user,
        text: params[:message],
        chat_conversation_account: conversation
      )
      success = { "result": "success", "account_id": to_user.id }
      render json: success
    end

  end
