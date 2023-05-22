Doorkeeper::Application.create!(name: 'Web', superapp: true, redirect_uri: Doorkeeper.configuration.native_redirect_uri, scopes: 'read write follow')

def ensure_group_category(text)
  existing = GroupCategories.where(text: text)
  GroupCategories.create({ text: text }).save! if existing.length == 0
end

# from https://gab.com/groups/browse/categories
initial_group_categories = [
  'Sports',
  'Politics',
  'Business',
  'Technology',
  'Animals',
  'Art',
  'Education',
  'Entertainment',
  'Health',
  'Faith',
  'Humor',
  'Travel',
  'Vehicles',
  'Style',
  'Hobbies'
]

if Rails.env.development?
  #
  # default user
  #
  domain = ENV['LOCAL_DOMAIN'] || Rails.configuration.x.local_domain
  admin  = Account.where(username: 'admin').first_or_initialize(username: 'admin')
  admin.save(validate: false)
  User.where(email: "admin@#{domain}")
    .first_or_initialize(
      email: "admin@#{domain}",
      password: 'administrator',
      password_confirmation: 'administrator',
      confirmed_at: Time.now.utc,
      admin: true,
      account: admin,
      agreement: true,
      approved: true
    ).save!

  #
  # group categories
  #
  initial_group_categories.each { |text| ensure_group_category(text) }
end
