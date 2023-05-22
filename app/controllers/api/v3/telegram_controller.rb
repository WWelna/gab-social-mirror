# frozen_string_literal: true

require 'open-uri'

class Api::V3::TelegramController <  Api::BaseController
  
  def create
    error = { "result": "error" }
    return render json: error unless ENV['TGBOT_SECRET_KEY'] && params[:key] == ENV['TGBOT_SECRET_KEY'] && !params[:chat].nil? && !params[:chat][:username].nil?
    channel = params[:chat]
    username = channel[:username].downcase
    make_post(username, params)
  end

  def make_post(feed, post)
    missing = { "result": "missing" }
    error = { "result": "error" }
    success = { "result": "success" }

    target1 = "--- https://t.me/#{feed}" + 10.chr
    target2 = target1 + 46.chr + 46.chr + 46.chr + 10.chr
    users = Setting.unscoped
      .where(var: 'telegram_channel', thing_type: 'User', value: target1)
      .or(Setting.unscoped.where(var: 'telegram_channel', thing_type: 'User', value: target2))
    if users.count > 0
      file = nil

      begin
        if post.key?(:attached)
          file = open(post[:attached])
        end

        users.each do |setting|
          attached = []
          user = setting.thing
          
          if post.key?(:attached) && !file.nil?
            attached = MediaAttachment.create!(file: file, account: user.account)
            attached = [attached.id]
          end

          puts "Making post for account: #{user.account.username}"
          if post.key?(:caption)
            text = post[:caption]
          elsif post.key?(:text)
            text = post[:text]
          else
            text = ""
          end
          PostStatusService.new.call(user.account,
            gms_skip: true,
            text: "#{text}",
            markdown: "#{text}",
            sensitive: false,
            media_ids: attached)
        end
      rescue => e
        puts "Error: #{e} #{e.backtrace.join("\n")}"
        return render json: error
      end
      return render json: success
    else
      return render json: missing
    end
  end
end
