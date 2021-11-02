# frozen_string_literal: true

namespace :gabsocial do
  desc 'Re-compute status statistics (replies count, reblogs count)'
  task :fix_status_stats, [:visibility] => :environment do |_t, args|
    ActiveRecord::Base.connection.execute "SET statement_timeout = 600000" # 10 minutes

    statuses = if args[:visibility]
                 Status.where(visibility: args[:visibility])
               else
                 Status.all
               end

    statuses.where(created_at: 1.month.ago..).find_each(&:resync_status_stat!)
  end
end
