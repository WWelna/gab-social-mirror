class AddCategoryToReports < ActiveRecord::Migration[6.0]
  def change
    add_column :reports, :category, :smallint
  end
end
