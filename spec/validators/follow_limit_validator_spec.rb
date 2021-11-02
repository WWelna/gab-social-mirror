# frozen_string_literal: true

RSpec.describe FollowLimitValidator do
  subject { described_class.limit_for_account(account) }

  let(:account) do
    Account.new({
      user: User.new(confirmed_at: confirmed_at),
      spam_flag: spam_flag,
      following_count: following_count,
      followers_count: 10_000,
    })
  end

  context 'when following limit has not been reached' do
    let(:following_count) { 7_499 }

    context 'when confirmed' do
      let(:confirmed_at) { Time.current }

      context 'when spam_flag is nil' do
        let(:spam_flag) { nil }
        it { is_expected.to eq(7_500) }
      end

      context 'when spam_flag is 1' do
        let(:spam_flag) { 1 }
        it { is_expected.to eq(0) }
      end

      context 'when spam_flag is 2' do
        let(:spam_flag) { 2 }
        it { is_expected.to eq(7_500) }
      end
    end

    context 'when unconfirmed' do
      let(:confirmed_at) { nil }

      context 'when spam_flag is nil' do
        let(:spam_flag) { nil }
        it { is_expected.to eq(10) }
      end

      context 'when spam_flag is 1' do
        let(:spam_flag) { 1 }
        it { is_expected.to eq(0) }
      end

      context 'when spam_flag is 2' do
        let(:spam_flag) { 2 }
        it { is_expected.to eq(10) }
      end
    end
  end

  context 'when following limit has been reached' do
    let(:following_count) { 7_500 }

    context 'when confirmed' do
      let(:confirmed_at) { Time.current }

      context 'when spam_flag is nil' do
        let(:spam_flag) { nil }
        it { is_expected.to eq(11_000) }
      end

      context 'when spam_flag is 1' do
        let(:spam_flag) { 1 }
        it { is_expected.to eq(0) }
      end

      context 'when spam_flag is 2' do
        let(:spam_flag) { 2 }
        it { is_expected.to eq(11_000) }
      end
    end

    context 'when unconfirmed' do
      let(:confirmed_at) { nil }

      context 'when spam_flag is nil' do
        let(:spam_flag) { nil }
        it { is_expected.to eq(10) }
      end

      context 'when spam_flag is 1' do
        let(:spam_flag) { 1 }
        it { is_expected.to eq(0) }
      end

      context 'when spam_flag is 2' do
        let(:spam_flag) { 2 }
        it { is_expected.to eq(10) }
      end
    end
  end
end
