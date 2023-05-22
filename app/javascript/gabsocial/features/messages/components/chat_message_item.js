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
  BREAKPOINT_SMALL,
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
import MediaGallery from '../../../components/media_gallery'
import StatusCard from '../../../components/status_card'
import { openModal } from '../../../actions/modal'

class ChatMessageItem extends ImmutablePureComponent {

  state = {
    isHovering: false,
    isNewDay: false,
    isCloseToMyLast: false,
    isExpired: false,
    showMediaAnyways: false,
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

  handleOnShowMediaAnyways = () => {
    this.setState({ showMediaAnyways: true })
  }

  setDeleteBtnRef = (c) => {
    this.deleteBtnRef = c
  }

  render() {
    const {
      chatMessage,
      isHidden,
      lastChatMessageDate,
      isSmall,
      isRequest,
      onOpenMedia,
    } = this.props
    const {
      isCloseToMyLast,
      isHovering,
      isNewDay,
      isExpired,
      showMediaAnyways,
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
    const hasContent = !!chatMessage.get('text') && chatMessage.get('text').length > 0
    const alt = account.get('id', null) === me
    const createdAt = chatMessage.get('created_at')
    const hasMedia = chatMessage.get('media_attachments').size > 0
    const hasManyMedia = chatMessage.get('media_attachments').size > 1
    const card = chatMessage.get('card')
    const avatarSize = isSmall ? 26 : 38
    const showWarning = !!csd.label && !csd.nulled
    const blurhashOnly = isRequest && !showMediaAnyways

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
      maxW80PC: 1,
      w50PC: hasMedia && !hasManyMedia && !isSmall && !showWarning,
      w75PC: ((hasMedia && hasManyMedia) || !!card) && !isSmall && !showWarning,
      w80PC: hasMedia && isSmall && !showWarning,
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

    const isMultiline = false
    const buttonContainerClasses = CX({
      d: 1,
      flexRow: isMultiline,
      displayNone: !isHovering,
    })

    const blurClass = blurhashOnly ? _s.blurImg : undefined
    const mediaContainerClasses = CX({
      d: 1,
      borderBottom1PX: hasContent,
      borderColorSecondary: hasContent,
    })

    const expirationDate = chatMessage.get('expires_at')
    let timeUntilExpiration
    if (!!expirationDate) {
      timeUntilExpiration = moment(expirationDate).fromNow()
    }

    const showMediaBtn = (
      <div className={[_s.d, _s.posAbs, _s.top0, _s.left0, _s.right0, _s.bottom0, _s.aiCenter, _s.jcCenter, _s.bgPrimaryOpaque].join(' ')}>
        <Button
          onClick={this.handleOnShowMediaAnyways}
          color='white'
          backgroundColor='black'
          className={_s.bgSecondaryDark_onHover}
        >
          <Text color='inherit' weight='bold' size='medium'>
            Show media
          </Text>
        </Button>
      </div>
    )

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
            <NavLink className={isSmall ? _s.mt5 : undefined} to={`/${account.get('username')}`}>
              <Avatar account={account} size={avatarSize} isStatic />
            </NavLink>

            <div className={messageInnerContainerClasses}>
              {
                csd.nulled &&
                <div className={[_s.d, _s.px15, _s.py5, _s.mt5, _s.mb5].join(' ')}>
                  <Text color='tertiary'>{csd.label}</Text>
                </div>
              }
              {
                showWarning &&
                <SensitiveMediaItem
                  noPadding
                  onClick={this.handleOnShowAnyways}
                  message={csd.label}
                  btnTitle='View'
                />
              }

              {
                (!csd.label && !csd.nulled) && hasMedia &&
                <div className={[mediaContainerClasses, _s.growOverflow].join(' ')}>
                  <MediaGallery
                    onOpenMedia={onOpenMedia}
                    blurhashOnly={blurhashOnly}
                    media={chatMessage.get('media_attachments')}
                  />
                  {blurhashOnly && showMediaBtn}
                </div>
              }

              {
                (!csd.label && !csd.nulled) && !!card && ! hasMedia &&
                <div className={mediaContainerClasses}>
                  <div className={[_s.d, blurClass].join(' ')}>
                    <StatusCard
                      key={`${card.get('id')}-status-card`}
                      blurhashOnly={blurhashOnly}
                      card={card}
                      isBorderless
                      isVertical
                    />
                  </div>
                  {blurhashOnly && showMediaBtn}
                </div>
              }

              {
                (!csd.label && !csd.nulled) && hasContent &&
                <div className={[_s.d, _s.px15, _s.py5].join(' ')}>
                  <div className={[_s.py5, _s.dangerousContent, _s.cPrimary].join(' ')} dangerouslySetInnerHTML={content} />
                </div>
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
  isRequest: state.getIn(['chat_conversations', state.getIn(['chat_messages', chatMessageId, 'chat_conversation_id']), 'is_approved']) === false,
  isSmall: state.getIn(['settings', 'window_dimensions', 'width']) <= BREAKPOINT_SMALL,
})

const mapDispatchToProps = (dispatch) => ({
  onOpenMedia(media, index) {
    dispatch(openModal('MEDIA', { index, media }));
  },
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
  lastChatMessageId: PropTypes.string,
  lastChatMessageDate: PropTypes.string,
  lastChatMessageSameSender: PropTypes.bool,
  chatMessageId: PropTypes.string.isRequired,
  chatMessage: ImmutablePropTypes.map,
  isHidden: PropTypes.bool,
  alt: PropTypes.bool,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatMessageItem)
