import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { Map as ImmutableMap } from 'immutable'
import { createSelector } from 'reselect'
import { supportsPassiveEvents } from 'detect-it'
import { changeSetting } from '../../actions/settings'
import { useEmoji } from '../../actions/emojis'
import { closePopover } from '../../actions/popover'
import { buildCustomEmojis } from '../emoji/emoji'
import PopoverLayout from './popover_layout'
import ColumnIndicator from '../column_indicator'
import Picker from 'emoji-mart/dist-es/components/picker/picker'
import Emoji from 'emoji-mart/dist-es/components/emoji/emoji'
import { dispatchWindowEvent } from '../../utils/events'

import '!style-loader!css-loader!emoji-mart/css/emoji-mart.css'

const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
  emoji_search: {
    id: 'emoji_button.search',
    defaultMessage: 'Search for emoji'
  },
  emoji_not_found: {
    id: 'emoji_button.not_found',
    defaultMessage: 'No emojos!! (╯°□°）╯︵ ┻━┻'
  },
  custom: { id: 'emoji_button.custom', defaultMessage: 'Custom' },
  recent: { id: 'emoji_button.recent', defaultMessage: 'Frequently used' },
  search_results: {
    id: 'emoji_button.search_results',
    defaultMessage: 'Search results'
  },
  people: { id: 'emoji_button.people', defaultMessage: 'People' },
  nature: { id: 'emoji_button.nature', defaultMessage: 'Nature' },
  food: { id: 'emoji_button.food', defaultMessage: 'Food & Drink' },
  activity: { id: 'emoji_button.activity', defaultMessage: 'Activity' },
  travel: { id: 'emoji_button.travel', defaultMessage: 'Travel & Places' },
  objects: { id: 'emoji_button.objects', defaultMessage: 'Objects' },
  symbols: { id: 'emoji_button.symbols', defaultMessage: 'Symbols' },
  flags: { id: 'emoji_button.flags', defaultMessage: 'Flags' }
})

const assetHost = process.env.CDN_HOST || ''

const backgroundImageFn = () => `${assetHost}/emoji/sheet_32.png`
const listenerOptions = supportsPassiveEvents ? { passive: true } : false

const perLine = 8
const lines = 2

const DEFAULTS = [
  '+1',
  'grinning',
  'kissing_heart',
  'heart_eyes',
  'laughing',
  'stuck_out_tongue_winking_eye',
  'sweat_smile',
  'joy',
  'yum',
  'disappointed',
  'thinking_face',
  'weary',
  'sob',
  'sunglasses',
  'heart',
  'ok_hand'
]

const categoriesSort = [
  'recent',
  'custom',
  'people',
  'nature',
  'foods',
  'activity',
  'places',
  'objects',
  'symbols',
  'flags'
]

const getFrequentlyUsedEmojis = createSelector(
  [state => state.getIn(['settings', 'frequentlyUsedEmojis'], ImmutableMap())],
  emojiCounters => {
    let emojis = emojiCounters
      .keySeq()
      .sort((a, b) => emojiCounters.get(a) - emojiCounters.get(b))
      .reverse()
      .slice(0, perLine * lines)
      .toArray()

    if (emojis.length < DEFAULTS.length) {
      let uniqueDefaults = DEFAULTS.filter(emoji => !emojis.includes(emoji))
      emojis = emojis.concat(
        uniqueDefaults.slice(0, DEFAULTS.length - emojis.length)
      )
    }

    return emojis
  }
)

const getCustomEmojis = createSelector(
  [state => state.get('custom_emojis')],
  emojis =>
    emojis
      .filter(e => e.get('visible_in_picker'))
      .sort((a, b) => {
        const aShort = a.get('shortcode').toLowerCase()
        const bShort = b.get('shortcode').toLowerCase()

        if (aShort < bShort) {
          return -1
        } else if (aShort > bShort) {
          return 1
        }

        return 0
      })
)

class EmojiPickerMenu extends ImmutablePureComponent {
  getI18n = () => {
    const { intl } = this.props

    return {
      search: intl.formatMessage(messages.emoji_search),
      notfound: intl.formatMessage(messages.emoji_not_found),
      categories: {
        search: intl.formatMessage(messages.search_results),
        recent: intl.formatMessage(messages.recent),
        people: intl.formatMessage(messages.people),
        nature: intl.formatMessage(messages.nature),
        foods: intl.formatMessage(messages.food),
        activity: intl.formatMessage(messages.activity),
        places: intl.formatMessage(messages.travel),
        objects: intl.formatMessage(messages.objects),
        symbols: intl.formatMessage(messages.symbols),
        flags: intl.formatMessage(messages.flags),
        custom: intl.formatMessage(messages.custom)
      }
    }
  }

  handleClick = (emoji, evt) => {
    if (!emoji.native) {
      emoji.native = emoji.colons
    }

    this.props.onPick(emoji)

    // emoji madness, press mod and keep clicking emojis 🤓
    const keepOpen = evt && (evt.shiftKey || evt.metaKey || evt.ctrlKey)

    if (!keepOpen) {
      this.props.onClose()
    }
  }

  handleModifierChange = modifier => {
    this.props.onSkinTone(modifier)
  }

  render() {
    const { intl, customEmojis, skinTone, frequentlyUsedEmojis } = this.props

    const title = intl.formatMessage(messages.emoji)

    return (
      <Picker
        backgroundImageFn={backgroundImageFn}
        custom={buildCustomEmojis(customEmojis)}
        title={title}
        i18n={this.getI18n()}
        onClick={this.handleClick}
        include={categoriesSort}
        recent={frequentlyUsedEmojis}
        skin={skinTone}
        perLine={8}
        emojiSize={29}
        sheetSize={32}
        set="twitter"
        color="#30CE7D"
        emoji=""
        autoFocus
        emojiTooltip
        onSkinChange={this.handleModifierChange}
      />
    )
  }
}

EmojiPickerMenu.propTypes = {
  customEmojis: ImmutablePropTypes.list,
  frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func.isRequired,
  onPick: PropTypes.func.isRequired,
  arrowOffsetLeft: PropTypes.string,
  arrowOffsetTop: PropTypes.string,
  skinTone: PropTypes.number.isRequired,
  onSkinTone: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired
}

EmojiPickerMenu.defaultProps = { frequentlyUsedEmojis: [] }

class EmojiPickerPopover extends ImmutablePureComponent {
  onHideDropdown = () => {
    this.props.onClosePopover()
  }

  onPick = emoji => {
    this.props.onPickEmoji(emoji) // to redux
    // this.props.onEmoji(emoji) // to ComposeForm
    const { composerId } = this.props
    const text = emoji.native || emoji.colons
    dispatchWindowEvent('composer-insert', { composerId, text })
  }

  render() {
    const {
      intl,
      onSkinTone,
      skinTone,
      frequentlyUsedEmojis,
      customEmojis,
      isXS
    } = this.props

    return (
      <PopoverLayout width={340} isXS={isXS} onClose={this.onHideDropdown}>
        <EmojiPickerMenu
          intl={intl}
          customEmojis={customEmojis}
          onClose={this.onHideDropdown}
          onPick={this.onPick}
          onSkinTone={onSkinTone}
          skinTone={skinTone}
          frequentlyUsedEmojis={frequentlyUsedEmojis}
        />
      </PopoverLayout>
    )
  }
}

const mapStateToProps = state => ({
  customEmojis: getCustomEmojis(state),
  skinTone: state.getIn(['settings', 'skinTone']),
  frequentlyUsedEmojis: getFrequentlyUsedEmojis(state)
})

const mapDispatchToProps = dispatch => ({
  onClosePopover: () => dispatch(closePopover()),
  onSkinTone: skinTone => dispatch(changeSetting(['skinTone'], skinTone)),
  onPickEmoji: emoji => dispatch(useEmoji(emoji))
})

EmojiPickerPopover.propTypes = {
  customEmojis: ImmutablePropTypes.list,
  frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.string),
  intl: PropTypes.object.isRequired,
  onPickEmoji: PropTypes.func.isRequired,
  onSkinTone: PropTypes.func.isRequired,
  skinTone: PropTypes.number.isRequired,
  onClosePopover: PropTypes.func.isRequired,
  isXS: PropTypes.bool,
  intl: PropTypes.object.isRequired
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(EmojiPickerPopover)
)
