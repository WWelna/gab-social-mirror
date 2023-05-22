class CopyPasteSpamService < BaseService
  EXPIRE_SECONDS = 120
  COPIES_MAX = 3
  
  def is_status_copy_paste_spam(account_id, status_hash)
    key = "account-status-count:#{account_id}:#{status_hash}"
    is_spam = Redis.current.incr(key) > COPIES_MAX
    Redis.current.expire(key, EXPIRE_SECONDS)
    is_spam
  end

  def is_comment_copy_paste_spam(account_id, comment_hash)
    key = "account-comment-count:#{account_id}:#{comment_hash}"
    is_spam = Redis.current.incr(key) > COPIES_MAX
    Redis.current.expire(key, EXPIRE_SECONDS)
    is_spam
  end
end
