import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment-mini'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { makeGetChatConversation } from '../../../selectors'
import { setChatConversationSelected } from '../../../actions/chats'
import { CX } from '../../../constants'
import Icon from '../../../components/icon'
import DisplayNameGroup from '../../../components/display_name_group'
import DisplayName from '../../../components/display_name'
import AvatarGroup from '../../../components/avatar_group'
import Text from '../../../components/text'
import RelativeTimestamp from '../../../components/relative_timestamp'

class ChatConversationsListItem extends ImmutablePureComponent {

  state = {
    chatMessageIsExpired: false,
  }

  static contextTypes = {
    router: PropTypes.object,
  }

  componentDidMount() {
    this._scheduleNextUpdate()
  }

  componentWillUnmount() {
    clearTimeout(this._timer)
  }

  _scheduleNextUpdate() {
    const { chatConversation } = this.props
    const { chatMessageIsExpired } = this.state

    if (!chatConversation || chatMessageIsExpired) return

    const lastMessage = chatConversation.get('last_chat_message', null)
    if (!lastMessage) return

    const expirationDate = lastMessage.get('expires_at')
    if (!expirationDate) return

    const msUntilExpiration = moment(expirationDate).valueOf() - moment().valueOf()
    this._timer = setTimeout(() => {
      this.setState({ chatMessageIsExpired: true })
    }, msUntilExpiration);
  }

  handleOnClick = () => {
    const { chatConversationId } = this.props
    this.props.onSetChatConversationSelected(chatConversationId)
    this.context.router.history.push(`/messages/${chatConversationId}`)
  }

  render() {
    const { selected, chatConversation } = this.props
    const { chatMessageIsExpired } = this.state

    if (!chatConversation) return <div />


    const containerClasses = CX({
      d: 1,
      w100PC: 1,
      bgTransparent: 1,
      bgSubtle_onHover: 1,
      noUnderline: 1,
      outlineNone: 1,
      cursorPointer: 1,
      pl15: 1,
    })

    const innerContainerClasses = CX({
      d: 1,
      flexRow: 1,
      aiStart: 1,
      aiCenter: 0,
      px15: 1,
      py15: 1,
      borderRight4PX: selected,
      borderColorBrand: selected,
    })

    const dividerClasses = CX({
      d: 1,
      posAbs: 1,
      h1PX: 1,
      bottom0: 1,
      right0: 1,
      left0: 1,
      w100PC: 1,
      bgSecondary: 1,
    })

    const avatarSize = 46
    const otherAccounts = chatConversation.get('other_accounts')
    const lastMessage = chatConversation.get('last_chat_message', null)
    const lastMessageSentAt = chatConversation.get('last_chat_message_sent_at', null)
    let lastMessageText = !!lastMessage ? lastMessage.get('text', '') : ''
    lastMessageText = lastMessageText.length >= 28 ? `${lastMessageText.substring(0, 28).trim()}...` : lastMessageText
    if (!lastMessageText && !!lastMessageSentAt || chatMessageIsExpired) {
      // delete or expired
      lastMessageText = 'Message deleted.'
    }
    const content = { __html: lastMessageText }
    const date = !!lastMessage ? lastMessage.get('created_at') : chatConversation.get('created_at')
    const isUnread = chatConversation.get('is_unread')
    const isMuted = chatConversation.get('is_muted')

    const previewTextClasses = CX({
      py5: 1,
      dangerousContent: 1,
      textAlignLeft: 1,
      cSecondary: chatMessageIsExpired,
    })

    return (
      <button
        className={containerClasses}
        onClick={this.handleOnClick}
      >

        { isUnread && !isMuted && <div className={[_s.d, _s.posAbs, _s.left0, _s.top50PC, _s.ml10, _s.mtNeg5PX, _s.circle, _s.w10PX, _s.h10PX, _s.bgBrand].join(' ')} /> }
        {
          isMuted &&
          <div className={[_s.d, _s.posAbs, _s.left0, _s.top50PC, _s.ml10, _s.mtNeg5PX, _s.circle, _s.w10PX, _s.h10PX, _s.bgTransparent].join(' ')}>
            <Icon id='audio-mute' className={_s.cError} size='12px' /> 
          </div>
        }

        <div className={innerContainerClasses}>
          <AvatarGroup accounts={otherAccounts} size={avatarSize} maxVisible={3} noHover />

          <div className={[_s.d, _s.pl10, _s.overflowHidden, _s.flexNormal].join(' ')}>
            <div className={[_s.d, _s.flexRow, _s.aiCenter].join(' ')}>
              <div className={[_s.d, _s.pt2, _s.pr5, _s.noUnderline, _s.overflowHidden, _s.flexNormal, _s.flexRow, _s.aiStart, _s.aiCenter].join(' ')}>
                <div className={_s.maxW100PC42PX}>
                  { otherAccounts.size === 1 && <DisplayName account={otherAccounts.get(0)} noHover /> }
                  { otherAccounts.size > 1 && <DisplayNameGroup accounts={otherAccounts} noHover /> }
                </div>
                <Text size='extraSmall' color='secondary' className={_s.mlAuto}>
                  <RelativeTimestamp timestamp={date} />
                </Text>
              </div>
            </div>

            <div className={previewTextClasses} dangerouslySetInnerHTML={content} />
          </div>
          <div className={dividerClasses} />
        </div>
      </button>
    )
  }

}

const mapStateToProps = (state, { chatConversationId }) => ({
  chatConversation: makeGetChatConversation()(state, { id: chatConversationId }),
  selectedId: state.getIn(['chats', 'selectedChatConversationId'], null),
  selected: state.getIn(['chats', 'selectedChatConversationId'], null) === chatConversationId,
})

const mapDispatchToProps = (dispatch) => ({
  onSetChatConversationSelected: (chatConversationId) => {
    dispatch(setChatConversationSelected(chatConversationId))
  },
})

ChatConversationsListItem.propTypes = {
  chatConversationId: PropTypes.string.isRequired,
  chatConversation: ImmutablePropTypes.map,
  onSetChatConversationSelected: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  source: PropTypes.string.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatConversationsListItem)