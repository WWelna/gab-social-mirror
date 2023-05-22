# frozen_string_literal: true

class Form::LinkBlockBatch
  include ActiveModel::Model
  include AccountableConcern

  attr_accessor :links, :action, :current_account

  def save
    case action
    when 'block'
      block_links
    when 'unblock'
      unblock_links
    end
  end

  private

  def block_links
    ApplicationRecord.transaction do
      links.each do |link|
        if !LinkBlock.exists?(link: link)
          link_block = LinkBlock.create!(link: link)
          log_action :create, link_block
        end
      end
    end

    true
  rescue ActiveRecord::RecordInvalid
    false
  end

  def unblock_links
    ApplicationRecord.transaction do
      LinkBlock.where(link: links).find_each do |link_block|
        link_block.destroy
        log_action :destroy, link_block
      end
    end

    true
  rescue ActiveRecord::RecordInvalid
    false
  end
end
