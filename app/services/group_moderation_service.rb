
=begin

⚠ Some methods are transactional such as approve_post, remove_post,
approve_user remove_user report_user. 

Check app/controllers/api/v1/groups/moderation_controller.rb

=end

class GroupModerationService # < BaseService
  # MAX_SCORE = 5

  def self.create_spam_score(opts)
    account = opts[:account]
    account_id = account.id
    text = opts[:content][:text]
    spam_score = 0
    account_stats = AccountStat.find_by(account_id: account_id)
    reply_count = account.statuses.where.not(in_reply_to_id: nil).count
    recent_blocks = Block.where(target_account_id: account_id)
      .where('created_at > ?', 1.week.ago)
      .count
    recent_mutes = Mute.where(target_account_id: account_id)
      .where('created_at > ?', 1.week.ago)
      .count
    recent_group_posts = account.statuses.where.not(group_id: nil)
      .where('statuses.id > ?', GabSocial::Snowflake.id_at(1.hour.ago))
      .count
    likes = Favourite.where(account_id: account_id).count

    status_count = account_stats.statuses_count
    following_count = account_stats.following_count
    followers_count = account_stats.followers_count

    # new account?
    spam_score += 1 if account.created_at > 2.months.ago
    spam_score += 1 if account.created_at > 1.months.ago

    # how much interaction from this user?
    spam_score += 1 if status_count < 25
    spam_score += 1 if following_count < 25
    spam_score += 1 if followers_count < 5
    spam_score += 1 if likes < 15
    spam_score += 1 if reply_count < 10
    spam_score += 1 if recent_blocks > 0
    spam_score += 1 if recent_mutes > 0
    spam_score += 1 if recent_group_posts > 0

    # status text has a link?
    spam_score += 1 if text.match?(/https?:\/\//)

    spam_score
  end

  def self.approve_post(opts)
    post = opts[:post]
    content = post['content']

    status = {}
    status[:gms_skip] = true
    status[:account_id] = post['account_id']
    status[:group_id] = post['group_id']
    status[:thread] = content['thread']
    status[:quote_of_id] = content['quote_of_id']
    begin
      if !status[:quote_of_id].nil?
        found = Status.find(status[:quote_of_id])
      end
    rescue => e
      status.delete("quote_of_id")
    end
    status[:text] = content['text']
    status[:markdown] = content['markdown']
    status[:poll] = content['poll']
    status[:media_ids] = content['media_ids'] || []
    if status[:media_ids].length > 0
      found_ids = MediaAttachment.where(id: status[:media_ids]).pluck(:id)
      status[:media_ids] = found_ids
    end
    status[:sensitive] = content['sensitive']
    status[:visibility] = content['visibility']
    status[:spoiler_text] = content['spoiler_text']
    status[:language] = content['language']

    new_status = PostStatusService.new.call(post.account, status)
    gme = GroupModerationEvent.find_by(group_moderation_status_id: post.id)
    if !gme.nil?
      gme.approved = true
      gme.acted_at = Time.now
      gme.status_id = new_status.id
      gme.save!
      LocalNotificationWorker.perform_async(post.account_id, gme.id, gme.class.name)
    end

    post.destroy!
  end

  def self.remove_post(opts)
    post = opts[:post]
    notify = opts[:notify] || true
    gme = GroupModerationEvent.find_by(group_moderation_status_id: post.id)
    if !gme.nil?
      gme.rejected = true
      gme.acted_at = Time.now
      gme.save!
      # since remove_user has it's own notification it's optional
      if notify
        LocalNotificationWorker.perform_async(
          post.account_id,
          gme.id,
          gme.class.name
        )
      end
    end
    post.destroy!
  end

  def self.approve_user(opts)
    post = opts[:post]
    account_id = post['account_id']
    group_id = post['group_id']
    list = GroupModerationStatus.unscoped
      .where(group_id: group_id)
      .where(account_id: account_id)
    list.each { |p| approve_post({ post: p }) }
    group_account = GroupAccount
      .where(group_id: group_id)
      .where(account_id: account_id)
      .first
    if !group_account.nil?
      group_account.is_approved = true
      group_account.save!
    end
  end

  def self.remove_user(opts)
    post = opts[:post]
    account_id = post['account_id']
    group_id = post['group_id']
    list = GroupModerationStatus.unscoped
      .where(group_id: group_id)
      .where(account_id: account_id)
    list.each { |p| remove_post({ post: p, notify: false }) }
    group_account = GroupAccount
      .where(group_id: group_id)
      .where(account_id: account_id)
      .first
    if !group_account.nil?
      group_account.destroy!
    end
    GroupRemovedAccount.create!(group_id: group_id, account_id: account_id)
    gme = GroupModerationEvent.find_by(group_moderation_status_id: post.id)
    if !gme.nil?
      gme.removed = true
      gme.reported = (opts[:reported] == true)
      gme.acted_at = Time.now
      gme.save!
      LocalNotificationWorker.perform_async(post.account_id, gme.id, gme.class.name)
    end
  end

  def self.report_user(opts)
    post = opts[:post]
    account_id = post['account_id']
    account = Account.find(account_id)
    current_account = opts[:current_account]
    opts[:reported] = true
    remove_user(opts)
    ReportService.new.call(
      current_account,
      account,

      # 💡 later we can get the statuses after removed from group
      # status_ids: [post.id],

      # 💡 maybe add info about group
      comment: "Reported account from Group Moderation",
      forward: true,
      category: 5
    )
  end
end
