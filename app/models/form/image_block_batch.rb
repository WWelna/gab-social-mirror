# frozen_string_literal: true

class Form::ImageBlockBatch
    include ActiveModel::Model
    include AccountableConcern
  
    attr_accessor :md5s, :action, :current_account
  
    def save
      case action
      when 'block'
        block_images
      when 'unblock'
        unblock_images
      end
    end
  
    private
  
    def block_images
      ApplicationRecord.transaction do
        md5s.each do |md5|
          if !ImageBlock.exists?(md5: md5)
            image_block = ImageBlock.create!(md5: md5)
            log_action :create, image_block
          end
        end
      end
  
      true
    rescue ActiveRecord::RecordInvalid
      false
    end
  
    def unblock_images
      ApplicationRecord.transaction do
        ImageBlock.where().find_each do |image_block|
          image_block.destroy
          log_action :destroy, image_block
        end
      end
  
      true
    rescue ActiveRecord::RecordInvalid
      false
    end
  end
  