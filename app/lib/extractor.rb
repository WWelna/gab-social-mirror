# frozen_string_literal: true

module Extractor
  extend Twitter::Extractor

  module_function

  # :yields: username, list_slug, start, end
  def extract_mentions_or_lists_with_indices(text)
    return [] unless text =~ Twitter::Regex[:at_signs]

    possible_entries = []

    text.to_s.scan(Account::MENTION_RE) do |screen_name, _|
      match_data = $LAST_MATCH_INFO
      after      = $'

      unless after =~ Twitter::Regex[:end_mention_match]
        start_position = match_data.char_begin(1) - 1
        end_position   = match_data.char_end(1)

        possible_entries << {
          screen_name: screen_name,
          indices: [start_position, end_position],
        }
      end
    end

    possible_entries.each { |mention| yield mention[:screen_name], mention[:indices].first, mention[:indices].last } if block_given?
    possible_entries
  end

  # :yields: hashtag, start, end
  def extract_hashtags_with_indices(text, **)
    return [] unless text =~ /#/

    tags = []

    text.scan(Tag::HASHTAG_RE) do |hash_text, _|
      match_data     = $LAST_MATCH_INFO
      start_position = match_data.char_begin(1) - 1
      end_position   = match_data.char_end(1)
      after          = $'

      if after =~ %r{\A://}
        hash_text.match(/(.+)(https?\Z)/) do |matched|
          hash_text     = matched[1]
          end_position -= matched[2].char_length
        end
      end

      tags << {
        hashtag: hash_text,
        indices: [start_position, end_position],
      }
    end

    tags.each { |tag| yield tag[:hashtag], tag[:indices].first, tag[:indices].last } if block_given?
    tags
  end

  # :yields: cashtag, start, end
  def extract_cashtags_with_indices(text, **)
    return [] unless text =~ /\$/

    tags = []

    text.scan(Tag::CASHTAG_RE) do |cash_text, _|
      match_data     = $LAST_MATCH_INFO
      start_position = match_data.char_begin(1) - 1
      end_position   = match_data.char_end(1)
      after          = $'

      if after =~ %r{\A://}
        cash_text.match(/(.+)(https?\Z)/) do |matched|
          cash_text     = matched[1]
          end_position -= matched[2].char_length
        end
      end

      tags << {
        cashtag: cash_text,
        indices: [start_position, end_position],
      }
    end

    tags.each { |tag| yield tag[:cashtag], tag[:indices].first, tag[:indices].last } if block_given?
    tags
  end

  # :yields: g_tag, start, end
  def extract_g_tags_with_indices(text, **)
    return [] unless text =~ /g\//

    tags = []

    text.scan(Tag::G_TAG_RE) do |tag_text, _|
      match_data     = $LAST_MATCH_INFO
      start_position = match_data.char_begin(1) - 2
      end_position   = match_data.char_end(1)
      after          = $'

      if after =~ %r{\A://}
        tag_text.match(/(.+)(https?\Z)/) do |matched|
          hash_text     = matched[1]
          end_position -= matched[2].char_length
        end
      end

      tags << {
        g_tag: tag_text,
        indices: [start_position, end_position],
      }
    end

    tags.each { |tag| yield tag[:g_tag], tag[:indices].first, tag[:indices].last } if block_given?
    tags
  end

end