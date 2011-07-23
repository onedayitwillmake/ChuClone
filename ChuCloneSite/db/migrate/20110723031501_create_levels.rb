class CreateLevels < ActiveRecord::Migration
  def self.up
    create_table :levels do |t|
      t.string :title
      t.timestamp :created_at
      t.integer :times_played
      t.integer :times_completed
      t.text :json
      t.integer :order_index

      t.timestamps
    end
  end

  def self.down
    drop_table :levels
  end
end
