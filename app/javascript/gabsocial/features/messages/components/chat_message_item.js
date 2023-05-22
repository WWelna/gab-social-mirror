import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment-mini'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { NavLink } from 'react-router-dom'
import {
  canShowChatMessage,
} from '../../../utils/can_show'
import { openPopover } from '../../../actions/popover'
import {
  showChatMessageAnyways,
} from '../../../actions/chat_messages'
import {
  CX,
  POPOVER_CHAT_MESSAGE_OPTIONS,
 } from '../../../constants'
import { me } from '../../../initial_state'
import Icon from '../../../components/icon'
import Avatar from '../../../components/avatar'
import Button from '../../../components/button'
import Text from '../../../components/text'
import DotTextSeperator from '../../../components/dot_text_seperator'
import SensitiveMediaItem from '../../../components/sensitive_media_item'
import { makeGetChatMessage } from '../../../selectors'

class ChatMessageItem extends ImmutablePureComponent {

  state = {
    hovering: false,
    isNewDay: false,
    isCloseToMyLast: false,
    isExpired: false,
  }

  componentDidMount() {
    const {
      lastChatMessageSameSender,
      lastChatMessageDate,
      chatMessage,
    } = this.props
    if (lastChatMessageDate && chatMessage) {
      const createdAt = chatMessage.get('created_at')
      const isNewDay = moment(createdAt).format('L') !== moment(lastChatMessageDate).format('L')
      const isCloseToMyLast = moment(lastChatMessageDate).diff(createdAt, 'minutes') < 60 && lastChatMessageSameSender && !isNewDay
      this.setState({
        isNewDay,
        isCloseToMyLast,
      })
    }

    this._scheduleNextUpdate()
  }

  componentWillUnmount() {
    clearTimeout(this._timer)
  }

  _scheduleNextUpdate() {
    const { chatMessage } = this.props
    const { isExpired } = this.state
    if (!chatMessage || isExpired) return

    const expirationDate = chatMessage.get('expires_at')
    if (!expirationDate) return

    const msUntilExpiration = moment(expirationDate).valueOf() - moment().valueOf()
    this._timer = setTimeout(() => {
      this.setState({ isExpired: true })
    }, msUntilExpiration);
  }

  handleOnMouseEnter = () => {
    this.setState({ isHovering: true }) 
  }

  handleOnMouseLeave = () => {
    this.setState({ isHovering: false })
  }

  handleMoreClick = () => {
    this.props.onOpenChatMessageOptionsPopover(this.props.chatMessageId, this.deleteBtnRef)
  }

  handleOnShowAnyways = () => {
    this.props.onShowChatMessageAnyways(this.props.chatMessageId)
  }

  setDeleteBtnRef = (c) => {
    this.deleteBtnRef = c
  }

  render() {
    const {
      chatMessage,
      isHidden,
      lastChatMessageDate,
    } = this.props
    const {
      isCloseToMyLast,
      isHovering,
      isNewDay,
      isExpired,
    } = this.state

    if (!chatMessage || isExpired) return <div />

    const account = chatMessage.get('account')
    if (!account) return <div />

    const accountId = account.get('id')

    //If account is spam and not mine, hide
    if (chatMessage.getIn(['account', 'is_spam']) && accountId !== me) {
      return null
    }

    const csd = canShowChatMessage(chatMessage)

    const content = { __html: chatMessage.get('text_html') }
    const alt = account.get('id', null) === me
    const createdAt = chatMessage.get('created_at')

    if (isHidden) {
      return (
        <React.Fragment>
          {account.get('display_name')}
          <div dangerouslySetInnerHTML={content} />
        </React.Fragment>
      )
    }

    const messageContainerClasses = CX({
      d: 1,
      flexRow: !alt,
      flexRowReverse: alt,
      pb5: 1,
    })

    const messageInnerContainerClasses = CX({
      d: 1,
      px15: !csd.label,
      py5: !csd.label,
      maxW80PC: 1,
      bgTertiary: alt || csd.nulled || !!csd.label,
      bgSecondary: !alt && !csd.nulled && !csd.label,
      radiusRounded: 1,
      ml10: 1,
      mr10: 1,
      overflowHidden: 1,
    })

    const lowerContainerClasses = CX({
      d: 1,
      pt10: 1,
      posAbs: 1,
      bottom0: 1,
      right0: alt,
      left0: !alt,
      displayNone: !isHovering,
      pl50: !alt,
      pr50: alt,
    })

    const buttonContainerClasses = CX({
      d: 1,
      flexRow: 1,
      displayNone: !isHovering,
    })

    const expirationDate = chatMessage.get('expires_at')
    let timeUntilExpiration
    if (!!expirationDate) {
      timeUntilExpiration = moment(expirationDate).fromNow()
    }

    return (
      <div
        className={[_s.d, _s.w100PC, _s.pb10].join(' ')}
        onMouseEnter={!csd.label && !csd.nulled ? this.handleOnMouseEnter : undefined}
        onMouseLeave={!csd.label && !csd.nulled ? this.handleOnMouseLeave : undefined}
      >
        {
          !!lastChatMessageDate && isNewDay &&
          <Text color='secondary' size='small' align='center' className={[_s.d, _s.py10].join(' ')}>
            {moment(createdAt).format('lll')}
          </Text>
        }

        <div className={[_s.d, _s.w100PC, _s.pb15].join(' ')}>

          <div className={messageContainerClasses}>
            <NavLink to={`/${chatMessage.getIn(['account', 'username'])}`}>
              <Avatar account={chatMessage.get('account')} size={38} />
            </NavLink>

            <div className={messageInnerContainerClasses}>
              {
                csd.nulled &&
                <div className={[_s.d, _s.px15, _s.py5, _s.mt5, _s.mb5].join(' ')}>
                  <Text color='tertiary'>{csd.label}</Text>
                </div>
              }
              {
                (!!csd.label && !csd.nulled) &&
                <SensitiveMediaItem
                  noPadding
                  onClick={this.handleOnShowAnyways}
                  message={csd.label}
                  btnTitle='View'
                />
              }
              {
                (!csd.label && !csd.nulled) &&
                <div className={[_s.py5, _s.dangerousContent, _s.cPrimary].join(' ')} dangerouslySetInnerHTML={content} />
              }
            </div>
            <div className={buttonContainerClasses}>
              <Button
                buttonRef={this.setDeleteBtnRef}
                onClick={this.handleMoreClick}
                color='tertiary'
                backgroundColor='none'
                icon='ellipsis'
                iconSize='18px'
              />
            </div>
          </div>
          <div className={lowerContainerClasses}>
            <Text size='extraSmall' color='tertiary' align={alt ? 'right' : 'left'}>
              {moment(createdAt).format('lll')}

              {
                !!expirationDate &&
                <React.Fragment>
                  <DotTextSeperator />
                  <Text size='extraSmall' color='tertiary' className={_s.ml5}>Expires {timeUntilExpiration}</Text>
                  <Icon id='stopwatch' size='11px' className={[_s.d, _s.ml5, _s.displayInline, _s.cSecondary].join(' ')} />
                </React.Fragment>
              }
            </Text>
          </div>
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state, { lastChatMessageId, chatMessageId }) => ({
  chatMessage: makeGetChatMessage()(state, { id: chatMessageId }),
  lastChatMessageDate: lastChatMessageId ? state.getIn(['chat_messages', `${lastChatMessageId}`, 'created_at'], null) : null,
  lastChatMessageSameSender: lastChatMessageId ? state.getIn(['chat_messages', `${lastChatMessageId}`, 'from_account_id'], null) === state.getIn(['chat_messages', `${chatMessageId}`, 'from_account_id'], null) : false,
})

const mapDispatchToProps = (dispatch) => ({
  onOpenChatMessageOptionsPopover(chatMessageId, targetRef) {
    dispatch(openPopover(POPOVER_CHAT_MESSAGE_OPTIONS, {
      targetRef,
      chatMessageId,
      position: 'top',
    }))
  },
  onShowChatMessageAnyways(chatMessageId) {
    dispatch(showChatMessageAnyways(chatMessageId))
  },
})

ChatMessageItem.propTypes = {
  intl: PropTypes.object.isRequired,
  lastChatMessageId: PropTypes.string,
  lastChatMessageDate: PropTypes.string,
  lastChatMessageSameSender: PropTypes.bool,
  chatMessageId: PropTypes.string.isRequired,
  chatMessage: ImmutablePropTypes.map,
  isHidden: PropTypes.bool,
  alt: PropTypes.bool,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatMessageItem)
