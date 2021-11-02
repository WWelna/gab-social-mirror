# frozen_string_literal: true

# Validates uniqueness based on the `unique_email` field, which is a normalized version of the
# email address (lowercase, Gmail's `.` and `+` tricks are removed)
#
# Email:
#   Foo.Bar+gab@gmail.com
# Unique Email:
#   foobar@gmail.com
class EmailUniquenessValidator < ActiveModel::Validator

  def validate(user)
    user.errors.add(:email, :taken) if email_taken?(user)
  end

  private

  def email_taken?(user)
    return(false) unless user.unique_email.present?

    relation = User.where(unique_email: user.unique_email)
    relation = relation.where.not(id: user.id) if user.persisted?

    return(relation.exists?)
  end

end
