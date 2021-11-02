# frozen_string_literal: true

class CreateChatConversationService < BaseService

  GROUP_CHAT_CONVERSATION_CREATION_LIMITS = {
    weekly: 40,
    daily: 10,
    hourly: 4,
  }

  def call(current_account, other_accounts)
    @current_account = current_account
    @other_accounts = other_accounts

    # must have @current_account and other_accounts
    return nil if @current_account.nil? || @other_accounts.nil?

    # see if any conversation exists with the given accounts
    existing_conversation = find_existing_conversation(@other_accounts.map {|acct| acct.id.to_s} )
    return existing_conversation unless existing_conversation.nil?

    validate_parameters!

    if @other_accounts.length == 1
      return create_single_chat!
    elsif @other_accounts.length > 1
      return create_group_chat!
    else
      return nil
    end
  end

  private
  
  def validate_parameters!
    if @other_accounts.length == 0
      raise GabSocial::NotPermittedError, "Unable to create conversation"
    end
    # only allow 1 account if not pro
    if @other_accounts.length > 1 && !@current_account.is_pro
      raise GabSocial::NotPermittedError, "Only GabPRO members can initiate a group conversation."
    end
    # MAX: 50 people in group chat
    if @other_accounts.length > 50
      raise GabSocial::NotPermittedError, "The maximum number of participants in a group conversation is 50."
    end
  end

  def validate_relationships!(other_account)
    if @current_account.chat_blocked_by?(other_account, @current_account)
      raise GabSocial::NotPermittedError, "Unable to create conversation. Account has you blocked from chatting with them."
    end
    if other_account.blocking?(@current_account)
      raise GabSocial::NotPermittedError, "Unable to create conversation. Account has you blocked."
    end
    # if private account and not following, do not allow and one account
    if other_account.locked? && !@current_account.following?(other_account)
      raise GabSocial::NotPermittedError, "Unable to create conversation. Account is private and you are not following."
    end
  end

  def is_relationship_valid?(other_account)
    if @current_account.chat_blocked_by?(other_account, @current_account)
      return false
    end
    if other_account.blocking?(@current_account)
      return false
    end
    # if private account and not following, do not allow and one account
    if other_account.locked? && !@current_account.following?(other_account)
      return false
    end

    return true
  end
  

  def create_single_chat!
    # create a participant (of the conversation) for myself with other accounts included
    my_chat = create_my_conversation(@other_accounts.map { |account| account.id.to_s })

    if @other_accounts.length == 1 && @other_accounts[0].id == @current_account.id
      # dont create two conversations if you are chatting with yourself
    elsif @other_accounts.length == 1 && @other_accounts[0].id != @current_account.id
      fop = @other_accounts.first
      validate_relationships!(fop)
      # create other participants convo automatically
      ChatConversationAccount.create!(
        account: fop,
        participant_account_ids: [@current_account.id],
        chat_conversation: my_chat.chat_conversation,
        is_approved: false
      )
    else
      # impossible
      return nil
    end

    return my_chat
  end

  def create_group_chat!
    my_chat = nil

    # filter out any invalid relationships
    filtered_other_accounts = @other_accounts.select {|account|
      is_relationship_valid?(account)
    }
    filtered_other_account_ids = filtered_other_accounts.map { |acct| acct.id.to_s }

    # must have more than 0
    if filtered_other_account_ids.length == 0
      raise GabSocial::NotPermittedError, "Unable to create conversation, validation failed."
    end
    
    # now, after validation, check again if a conversation with all of these members exists
    existing_chat = find_existing_conversation(filtered_other_account_ids)
    return existing_chat unless existing_chat.nil?

    # create new for me
    my_chat = create_my_conversation(filtered_other_account_ids)

    # cycle other accounts
    for other_account in filtered_other_accounts
      # map the ids to an array for THIS other_account
      this_conversation_participants_ids = filtered_other_accounts.map { |account|
        account.id.to_s
        # reject id if its my id, append my id at end
      }.reject { |id| id == other_account.id.to_s} << @current_account.id.to_s    

      # create a partipant (of the conversation) for each of the other accounts
      ChatConversationAccount.create!(
        account: other_account,
        participant_account_ids: this_conversation_participants_ids,
        chat_conversation: my_chat.chat_conversation,
        is_approved: false
      )
    end

    return my_chat
  end


  def create_my_conversation(other_account_ids)
    # create the empty conversation
    chat_conversation = ChatConversation.create

    return ChatConversationAccount.create!(
      account: @current_account,
      participant_account_ids: other_account_ids,
      chat_conversation: chat_conversation,
      is_approved: true
    )
  end

  
  def find_existing_conversation(other_account_ids)
    chat = @current_account.chat_conversation_accounts.find_by(participant_account_ids: other_account_ids)

    # if found, reset to visible and not left group chat
    if !chat.nil? 
      if !chat.left_group_chat_at.nil? || chat.is_hidden?
        chat.update!(
          left_group_chat_at: nil,
          is_hidden: false
        )
      end
    end

    return chat
  end

end
