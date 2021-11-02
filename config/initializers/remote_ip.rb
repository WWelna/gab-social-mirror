# frozen_string_literal: true

# Check Cloudflare's "True-Client-IP" header for an IP Address
ActiveSupport.on_load(:action_controller) do
  ActionDispatch::Request.class_eval do
    prepend(Module.new do
      def remote_ip
        headers['True-Client-IP'] || super
      end
    end)
  end
end
