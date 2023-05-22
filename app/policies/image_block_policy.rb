# frozen_string_literal: true

class ImageBlockPolicy < ApplicationPolicy
    def index?
      staff?
    end
  
    def create?
      staff?
    end
  
    def destroy?
      staff?
    end
  end
  