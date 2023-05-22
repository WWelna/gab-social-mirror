class CreateJoinTableMediaAttachmentsChatMessages < ActiveRecord::Migration[6.0]
  def change
    create_join_table :media_attachments, :chat_messages do |t|
      t.index [:chat_message_id, :media_attachment_id], name: 'index_chat_message_medias_on_cm_id_and_ma_id'
    end
  end
end
