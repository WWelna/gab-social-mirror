# frozen_string_literal: true

namespace :dummy_data do
  desc 'Import dummy data into the database, to create a more realistic development experience'
  task seed: :environment do
    raise 'Only run this in development' unless Rails.env.development?

    domain = ENV['LOCAL_DOMAIN'] || Rails.configuration.x.local_domain

    admin = Account.find_by!(username: 'admin')

    accounts = 1.upto(1_000).map do |num|
      username = "#{Faker::Internet.username(separators: %w[_])}#{num}"
      password = Faker::Internet.password

      Account.create!(username: username).tap do |account|
        account.create_user!({
          email: "#{username}@#{domain}",
          password: password,
          password_confirmation: password,
          agreement: true,
          approved: true
        })
      end
    end

    accounts.each do |acct|
      FollowService.new.call(admin, acct)
    end

    statuses = (accounts + [admin]).map do |account|
      PostStatusService.new.call(account, text: Faker::Lorem.paragraph(sentence_count: 20))
    end

    accounts.sample(200).zip(statuses.sample(200)).each do |account, status|
      ReblogService.new.call(account, status)
    end
  end

  desc 'Create a Group Collection feed'
  task group: :environment do
    accounts = Account.all
    groups = Group.all

    statuses = (160..200).map do |i|
      group = groups.sample
      account = accounts[i]

      account.groups << group unless account.groups.include?(group)

      PostStatusService.new.call(
        account,
        text: Faker::Lorem.paragraph(sentence_count: 20),
        group_id: group.id
      )
    end

    statuses.each do |status|
      accounts.sample(rand(2..20)).each do |account|
        next if status.account_id == account.id
        ReblogService.new.call(account, status)
      end

      accounts.sample(rand(50..100)).each do |account|
        next if status.account_id == account.id
        FavouriteService.new.call(account, status)
      end

      accounts.sample(rand(1..10)).each do |account|
        next if status.account_id == account.id
        PostStatusService.new.call(
          account,
          text: Faker::Lorem.paragraph(sentence_count: 20),
          thread: status
        )
      end
    end
  end

  desc 'Create an Explore feed'
  task explore: :environment do
    accounts = Account.all

    durations = [
      1.minute..8.hours,
      9.hours..23.hours,
      1.day..7.days,
      8.days..30.days,
      31.days..1.year,
    ]

    statuses = []

    durations.each do |time_range|
      (160..200).each do |i|
        created_at = rand(time_range).ago
        status = PostStatusService.new.call(
          accounts[i],
          text: Faker::Lorem.paragraph(sentence_count: 20)
        )

        status.update!(created_at: created_at)
        statuses << status
      end
    end

    statuses.each do |status|
      accounts.sample(rand(2..20)).each do |account|
        next if status.account_id == account.id
        ReblogService.new.call(account, status)
      end

      accounts.sample(rand(50..100)).each do |account|
        next if status.account_id == account.id
        FavouriteService.new.call(account, status)
      end

      accounts.sample(rand(1..10)).each do |account|
        next if status.account_id == account.id
        reply = PostStatusService.new.call(
          account,
          text: Faker::Lorem.paragraph(sentence_count: 20),
          thread: status
        )

        accounts.sample(rand(0..10)).each do |account2|
          next if reply.account_id == account2.id
          reply2 = PostStatusService.new.call(
            account2,
            text: Faker::Lorem.paragraph(sentence_count: 20),
            thread: reply
          )

          accounts.sample(rand(0..5)).each do |account3|
            next if reply2.account_id == account3.id
            PostStatusService.new.call(
              account3,
              text: Faker::Lorem.paragraph(sentence_count: 20),
              thread: reply2
            )
          end
        end
      end
    end
  end
end
