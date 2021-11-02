# frozen_string_literal: true

namespace :gabsocial do
  desc 'Re-compute user statistics (following cnt, followers cnt, etc.)'
  task :fix_account_stats => :environment do
    AccountStat.find_each do |account_stat|
      account_stat.resync!(reload: false)
    end
  end
end
