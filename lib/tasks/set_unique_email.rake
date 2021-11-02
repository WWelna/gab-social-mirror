# frozen_string_literal: true

namespace :gabsocial do
  desc 'Sets the unique_email column for all users'
  task :set_unique_email => :environment do
    User.where(unique_email: [nil, '']).find_each do |user|
      user.email = user.email
      user.save(validate: false)
    end
  end
end
