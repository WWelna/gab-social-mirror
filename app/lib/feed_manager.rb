# frozen_string_literal: true

require 'singleton'

class FeedManager
  include Singleton

  # status or chatMessage
  def filter?(timeline_type, status, receiver_id)
    if timeline_type == :home
      filter_from_home?(status, receiver_id)
    elsif timeline_type == :chat_message
      filter_from_chat_messages?(status, receiver_id)
    elsif timeline_type == :mentions
      filter_from_mentions?(status, receiver_id)
    else
      false
    end
  end

  private

  def blocks_or_mutes?(receiver_id, account_ids, context)
    Block.where(account_id: receiver_id, target_account_id: account_ids).any? ||
      (context == :home ? Mute.where(account_id: receiver_id, target_account_id: account_ids).any? : Mute.where(account_id: receiver_id, target_account_id: account_ids, hide_notifications: true).any?)
  end

  def chat_blocks?(receiver_id, account_ids)
    ChatBlock.where(account_id: receiver_id, target_account_id: account_ids).any?
  end

  def filter_from_home?(status, receiver_id)
    return false if receiver_id == status.account_id
    return true  if status.reply? && (status.in_reply_to_id.nil? || status.in_reply_to_account_id.nil?)
    return true  if phrase_filtered?(status, receiver_id, :home)

    check_for_blocks = status.active_mentions.pluck(:account_id)
    check_for_blocks.concat([status.account_id])

    if status.reblog?
      check_for_blocks.concat([status.reblog.account_id]) unless status.reblog.nil?
      check_for_blocks.concat(status.reblog.active_mentions.pluck(:account_id)) unless status.reblog.nil?
    end

    return true if blocks_or_mutes?(receiver_id, check_for_blocks, :home)

    if status.reply? && !status.in_reply_to_account_id.nil?                                                                      # Filter out if it's a reply
      should_filter   = !Follow.where(account_id: receiver_id, target_account_id: status.in_reply_to_account_id).exists?         # and I'm not following the person it's a reply to
      should_filter &&= receiver_id != status.in_reply_to_account_id                                                             # and it's not a reply to me
      should_filter &&= status.account_id != status.in_reply_to_account_id                                                       # and it's not a self-reply
      return should_filter
    elsif status.reblog? && !status.reblog.nil?                                                                                  # Filter out a reblog
      should_filter ||= Block.where(account_id: status.reblog.account_id, target_account_id: receiver_id).exists?                # or if the author of the reblogged status is blocking me
      return should_filter
    end

    return false if status.group_id

    false
  end

  def filter_from_chat_messages?(chat_message, receiver_id)
    # all filtering, muting, (normal account 1:1) blocking done client side
    # clat blocks actually hide the content
    check_for_blocks = [chat_message.from_account_id]
    return true if chat_blocks?(receiver_id, check_for_blocks)

    false
  end

  def filter_from_mentions?(status, receiver_id)
    return true if receiver_id == status.account_id
    return true if phrase_filtered?(status, receiver_id, :notifications)

    # This filter is called from NotifyService, but already after the sender of
    # the notification has been checked for mute/block. Therefore, it's not
    # necessary to check the author of the gab for mute/block again
    check_for_blocks = status.active_mentions.pluck(:account_id)
    check_for_blocks.concat([status.in_reply_to_account]) if status.reply? && !status.in_reply_to_account_id.nil?

    should_filter   = blocks_or_mutes?(receiver_id, check_for_blocks, :mentions)                                                         # Filter if it's from someone I blocked, in reply to someone I blocked, or mentioning someone I blocked (or muted)
    should_filter ||= (status.account.silenced? && !Follow.where(account_id: receiver_id, target_account_id: status.account_id).exists?) # of if the account is silenced and I'm not following them

    should_filter
  end

  def phrase_filtered?(status, receiver_id, context)
    active_filters = Rails.cache.fetch("filters:#{receiver_id}") { CustomFilter.where(account_id: receiver_id).active_irreversible.to_a }.to_a

    active_filters.select! { |filter| filter.context.include?(context.to_s) && !filter.expired? }

    active_filters.map! do |filter|
      if filter.whole_word
        sb = filter.phrase =~ /\A[[:word:]]/ ? '\b' : ''
        eb = filter.phrase =~ /[[:word:]]\z/ ? '\b' : ''

        /(?mix:#{sb}#{Regexp.escape(filter.phrase)}#{eb})/
      else
        /#{Regexp.escape(filter.phrase)}/i
      end
    end

    return false if active_filters.empty?

    combined_regex = active_filters.reduce { |memo, obj| Regexp.union(memo, obj) }
    status         = status.reblog if status.reblog?

    !combined_regex.match(Formatter.instance.plaintext(status)).nil? ||
      (status.spoiler_text.present? && !combined_regex.match(status.spoiler_text).nil?)
  end

  def phrase_filtered_from_chat_message?(chat_message, receiver_id, context)
    active_filters = Rails.cache.fetch("filters:#{receiver_id}") { CustomFilter.where(account_id: receiver_id).active_irreversible.to_a }.to_a

    active_filters.select! { |filter| filter.context.include?(context.to_s) && !filter.expired? }

    active_filters.map! do |filter|
      if filter.whole_word
        sb = filter.phrase =~ /\A[[:word:]]/ ? '\b' : ''
        eb = filter.phrase =~ /[[:word:]]\z/ ? '\b' : ''

        /(?mix:#{sb}#{Regexp.escape(filter.phrase)}#{eb})/
      else
        /#{Regexp.escape(filter.phrase)}/i
      end
    end

    return false if active_filters.empty?

    combined_regex = active_filters.reduce { |memo, obj| Regexp.union(memo, obj) }

    !combined_regex.match(chat_message.text).nil?
  end

end
