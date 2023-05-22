# frozen_string_literal: true

class ProcessCommentMentionsService < BaseService

  def call(comment)
    mentions = []
    current_mention_count = 0
    maximum_mentions = 8
    
    comment.text = comment.text.gsub(Account::MENTION_RE) do |match|
      next match if current_mention_count >= maximum_mentions

      username, domain  = Regexp.last_match(1).split('@')
      mentioned_account = Account.find_local(username)

      next match if mentioned_account.nil? || mentioned_account&.suspended?

      current_mention_count += 1

      mentions << mentioned_account.comment_mentions.where(comment: comment).first_or_create(comment: comment)

      "@#{mentioned_account.acct}"
    end

    comment.save!

    mentions.each { |mention| create_notification(mention) }
  end

  private

  def create_notification(mention)
    mentioned_account = mention.account

    if mentioned_account.local?
      LocalNotificationWorker.perform_async(mentioned_account.id, mention.id, mention.class.name)
    end
  end

end
