class CreateImageBlocks < ActiveRecord::Migration[5.2]
    def up
      create_table :image_blocks do |t|
        t.string :md5, null: false, default: ''
        t.timestamps null: false
      end
      
      add_index :image_blocks, :md5, unique: true
    end
end