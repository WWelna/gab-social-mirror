import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import throttle from 'lodash/throttle'
import { List as ImmutableList } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import debounce from 'lodash/debounce'
import { me } from '../../../initial_state'
import { CX, MOUSE_IDLE_DELAY } from '../../../constants'
import { setChatConversationSelected } from '../../../actions/chats'
import {
  expandChatMessages,
  scrollBottomChatMessageConversation,
} from '../../../actions/chat_conversation_messages'
import { readChatConversation } from '../../../actions/chat_conversations'
import IntersectionObserverArticle from '../../../components/intersection_observer_article'
import IntersectionObserverWrapper from '../../ui/util/intersection_observer_wrapper'
import ChatMessageItem from './chat_message_item'
import ColumnIndicator from '../../../components/column_indicator'
import LoadMore from '../../../components/load_more'
import Text from '../../../components/text'
import { supportsPassiveEvents, primaryInput } from 'detect-it'

const evtOpts = supportsPassiveEvents ? { passive: true } : false

class ChatMessageScrollingList extends ImmutablePureComponent {

  state = {
    isRefreshing: false,
  }

  intersectionObserverWrapper = new IntersectionObserverWrapper()

  scrollContainerRef = null

  mouseIdleTimer = null
  mouseMovedRecently = false
  lastScrollWasSynthetic = false
  scrollToTopOnMouseIdle = false

  get scroller() {
    const { scrollingElement } = document
    const { scrollContainerRef } = this
    if (this.props.isXS && scrollingElement !== null) {
      return scrollingElement
    }
    return scrollContainerRef
  }

  componentDidMount () {
    this.props.onExpandChatMessages()
    this.scroller.addEventListener('scroll', this.handleScroll, evtOpts)
    this.scroller.addEventListener('touchmove', this.handleScroll, evtOpts)
    this.scroller.addEventListener('wheel', this.handleWheel)
    this.intersectionObserverWrapper.connect()
    // Handle initial scroll posiiton
    this.handleScroll()
    this.scrollToBottom()
  }

  componentWillUnmount() {
    this.props.onSetChatConversationSelected(null)
    if (this.scroller) {
      this.scroller.removeEventListener('scroll', this.handleScroll)
      this.scroller.removeEventListener('touchmove', this.handleScroll)
      this.scroller.removeEventListener('wheel', this.handleWheel)
    }
    this.intersectionObserverWrapper.disconnect()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.chatConversationId !== this.props.chatConversationId) {
      this.props.onExpandChatMessages()
      this.scrollToBottom()
    } else if (
      prevProps.chatMessageIds.size === 0 &&
      this.props.chatMessageIds.size > 0
    ) {
      // previously it was loadin, there was nothing to scroll down to, and now
      // there are messages so scroll down
      this.scrollToBottom()
    }

    // Reset the scroll position when a new child comes in in order not to
    // jerk the scrollbar around if you're already scrolled down the page.
    if (snapshot !== null && this.scroller) {
      this.setScrollTop(this.scroller.scrollHeight - snapshot)
    }

    if (this.state.isRefreshing) {
      this.setState({ isRefreshing: false })
    }

    if (prevProps.chatMessageIds.size === 0 && this.props.chatMessageIds.size > 0) {
      this.scrollToBottom()
      this.props.onReadChatConversation()
    } else if (this.props.chatMessageIds.size - prevProps.chatMessageIds.size === 1) {
      this.scrollToBottom()
    }
  }

  onLoadMore = maxId => this.props.onExpandChatMessages({ maxId })

  getCurrentChatMessageIndex = id => this.props.chatMessageIds.indexOf(id)

  handleMoveUp = id => {
    const elementIndex = this.getCurrentChatMessageIndex(id) - 1
    this._selectChild(elementIndex, true)
  }

  handleMoveDown = id => {
    const elementIndex = this.getCurrentChatMessageIndex(id) + 1
    this._selectChild(elementIndex, false)
  }

  setScrollTop = (newScrollTop) => {
    if (this.scroller.scrollTop !== newScrollTop) {
      this.lastScrollWasSynthetic = true
      this.scroller.scrollTop = newScrollTop
    }
  }

  scrollToBottom = debounce(() => {
    if (this.messagesEnd) {
      this.messagesEnd.scrollIntoView()
    }
  }, 50)
  
  _selectChild(index, align_top) {
    const container = this.node.node
    const element = container.querySelector(`article:nth-of-type(${index + 1}) .focusable`)

    if (element) {
      if (align_top && container.scrollTop > element.offsetTop) {
        element.scrollIntoView(true)
      } else if (!align_top && container.scrollTop + container.clientHeight < element.offsetTop + element.offsetHeight) {
        element.scrollIntoView(false)
      }
      element.focus()
    }
  }

  handleLoadOlder = debounce(() => {
    const maxId = this.props.chatMessageIds.size > 0 ? this.props.chatMessageIds.last() : undefined
    this.onLoadMore(maxId)
  }, 300, { leading: true })

  handleScroll = throttle(() => {
    if (this.scroller) {
      const { offsetHeight, scrollTop, scrollHeight } = this.scroller
      const offset = scrollHeight - scrollTop - offsetHeight

      if (scrollTop < 300 && this.props.hasMore && !this.props.isLoading) {
        this.handleLoadOlder()
      }

      if (offset < 100) {
        this.props.onScrollToBottom()
      }

      if (!this.lastScrollWasSynthetic) {
        // If the last scroll wasn't caused by setScrollTop(), assume it was
        // intentional and cancel any pending scroll reset on mouse idle
        this.scrollToTopOnMouseIdle = false
      }
      this.lastScrollWasSynthetic = false
    }
  }, 150, {
    trailing: true,
  })

  handleWheel = throttle(() => {
    this.scrollToTopOnMouseIdle = false
    this.handleScroll()
  }, 150, {
    trailing: true,
  })

  clearMouseIdleTimer = () => {
    if (this.mouseIdleTimer === null) return

    clearTimeout(this.mouseIdleTimer)
    this.mouseIdleTimer = null
  }

  handleMouseMove = throttle(() => {
    // As long as the mouse keeps moving, clear and restart the idle timer.
    this.clearMouseIdleTimer()
    this.mouseIdleTimer = setTimeout(this.handleMouseIdle, MOUSE_IDLE_DELAY)

    // Only set if we just started moving and are scrolled to the top.
    if (!this.mouseMovedRecently && this.scroller.scrollTop === 0) {
      this.scrollToTopOnMouseIdle = true
    }

    // Save setting this flag for last, so we can do the comparison above.
    this.mouseMovedRecently = true
  }, MOUSE_IDLE_DELAY / 2)

  handleMouseIdle = () => {
    if (this.props.isXS && this.scrollToTopOnMouseIdle && this.scroller) {
      this.setScrollTop(this.scroller.scrollHeight)
    }

    this.mouseMovedRecently = false
    this.scrollToTopOnMouseIdle = false
  }

  getSnapshotBeforeUpdate(prevProps) {
    const someItemInserted = prevProps.chatMessageIds.size > 0 &&
      prevProps.chatMessageIds.size < this.props.chatMessageIds.size &&
      prevProps.chatMessageIds.get(prevProps.chatMessageIds.size - 1) !== this.props.chatMessageIds.get(this.props.chatMessageIds.size - 1)

    if (someItemInserted && (this.scroller.scrollTop > 0 || this.mouseMovedRecently)) {
      return this.scroller.scrollHeight - this.scroller.scrollTop
    }

    return null
  }
  
  setRef = ref => (this.node = ref)

  containerRef = ref => (this.containerNode = ref)

  setMessagesEnd = ref => (this.messagesEnd = ref)

  setScrollContainerRef = ref => (this.scrollContainerRef = ref)

  render() {
    const {
      chatConversationId,
      chatMessageIds,
      isLoading,
      hasMore,
      amITalkingToMyself,
      onScroll,
      isXS,
    } = this.props
    const { isRefreshing } = this.state

    const scrollableContent = chatMessageIds
      .sort(function(a, b) {
        // arguably it should be done in the reducer but at the time of reading
        // these it could not be understood
        if (a > b) {
          return 1
        } else if (b > a) {
          return -1
        }
        return 0
      })
      .map((chatMessageId, index) =>
        <ChatMessageItem
          key={`chat-message-${chatConversationId}-${chatMessageId}`}
          chatMessageId={chatMessageId}
          lastChatMessageId={chatMessageIds[index - 1]}
          onMoveUp={this.handleMoveUp}
          onMoveDown={this.handleMoveDown}
        />
      )

    const containerClasses = CX({
      d: 1,
      bgPrimary: 1,
      boxShadowNone: 1,
      posAbs: !isXS,
      bottom60PX: !isXS,
      left0: !isXS,
      right0: !isXS,
      top60PX: !isXS,
      w100PC: 1,
      overflowHidden: 1,
    })
    return (
      <div
        onMouseMove={this.handleMouseMove}
        className={containerClasses}
        ref={this.containerRef}
      >
        <div
          className={[_s.d, _s.h100PC, _s.w100PC, _s.px15, _s.py15, _s.overflowYScroll].join(' ')}
          ref={this.setScrollContainerRef}
        >
          {
            amITalkingToMyself &&
            <div className={[_s.d, _s.bgTertiary, _s.radiusSmall, _s.mt5, _s.ml10, _s.mr15, _s.px15, _s.py15, _s.mb15].join(' ')}>
              <Text size='medium' color='secondary'>
                This is a chat conversation with yourself. Use this space to keep messages, links and texts.
              </Text>
            </div>
          }

          {(hasMore && !isLoading) && <LoadMore onClick={this.handleLoadOlder} />}

          { isLoading && <ColumnIndicator type='loading' /> }
          
          <div role='feed'>{scrollableContent}</div>

          <div
            key='end-message'
            style={{ float: 'left', clear: 'both' }}
            ref={this.setMessagesEnd}
          />
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state, { chatConversationId }) => {
  const otherAccountIds = state.getIn(['chat_conversations', chatConversationId, 'other_account_ids'], ImmutableList())
  const amITalkingToMyself = otherAccountIds.get(0) === me

  return {
    amITalkingToMyself,
    chatMessageIds: state.getIn(['chat_conversation_messages', chatConversationId, 'items'], ImmutableList()),
    isLoading: state.getIn(['chat_conversation_messages', chatConversationId, 'isLoading'], true),
    hasMore: state.getIn(['chat_conversation_messages', chatConversationId, 'hasMore'], false),
  }
}

const mapDispatchToProps = (dispatch, { chatConversationId }) => ({
  onScrollToBottom: debounce(() => {
    dispatch(scrollBottomChatMessageConversation(chatConversationId, true))
  }, 100),
  onScroll: debounce(() => {
    dispatch(scrollBottomChatMessageConversation(chatConversationId, false))
  }, 100),
  onExpandChatMessages(params) {
    dispatch(expandChatMessages(chatConversationId, params))
  },
  onSetChatConversationSelected: (chatConversationId) => {
    dispatch(setChatConversationSelected(chatConversationId))
  },
  onReadChatConversation() {
    dispatch(readChatConversation(chatConversationId))
  },
})

ChatMessageScrollingList.propTypes = {
  chatMessageIds: ImmutablePropTypes.list.isRequired,
  chatConversationId: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  hasMore: PropTypes.bool,
  isXS: PropTypes.bool,
  onExpandChatMessages: PropTypes.func,
  onClearTimeline: PropTypes.func,
  onScrollToTop: PropTypes.func,
  onScroll: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatMessageScrollingList)
