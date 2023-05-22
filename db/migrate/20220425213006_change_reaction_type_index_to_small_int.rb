class ChangeReactionTypeIndexToSmallInt < ActiveRecord::Migration[6.0]
  disable_ddl_transaction!

  def change
    safety_assured { change_column :reaction_types, :index, :smallint }
  end
end
