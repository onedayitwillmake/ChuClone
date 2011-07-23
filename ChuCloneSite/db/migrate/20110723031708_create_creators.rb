class CreateCreators < ActiveRecord::Migration
  def self.up
    create_table :creators do |t|
      t.string :facebook_id
      t.string :username

      t.timestamps
    end
  end

  def self.down
    drop_table :creators
  end
end
