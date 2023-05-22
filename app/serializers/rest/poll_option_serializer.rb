# frozen_string_literal: true

class REST::PollOptionSerializer < ActiveModel::Serializer
  attributes :id, :title, :votes_count

end