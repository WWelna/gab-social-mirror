import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import throttle from 'lodash/throttle'
import noop from 'lodash/noop'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List as ImmutableList } from 'immutable'
import {
  fetchChatConversations,
  expandChatConversations,
  fetchChatConversationRequested,
  expandChatConversationRequested,
  fetchChatConversationMuted,
  expandChatConversationMuted,
} from '../../../actions/chat_conversations'
import AccountPlaceholder from '../../../components/placeholder/account_placeholder'
import ChatConversationsListItem from './chat_conversations_list_item'
import ChatConversationsListHeader from './chat_conversations_list_header'
import ScrollableList from '../../../components/scrollable_list'

class ChatConversationsList extends ImmutablePureComponent {

  componentDidMount() {
    const { source } = this.props
    if (source === 'approved') {
      this.props.onFetchChatConversations(this.props.source, { pinned: true })
    }
    this.props.onFetchChatConversations(this.props.source)
  }

  handleLoadMore = throttle(() => {
    this.props.onExpandChatConversations(this.props.source)
  }, 300, { leading: true })

  render() {
    const {
      hasMore,
      isLoading,
      source,
      chatConversationIds,
      pinnedChatConversationIds,
      isSearching,
    } = this.props

    const showPinned = !isSearching && source === 'approved' && pinnedChatConversationIds.size > 0
    const topTitle = isSearching ? 'SEARCH RESULTS' : 'ALL CHATS'
    
    return (
      <div className={[_s.d, _s.w100PC, _s.overflowHidden, _s.boxShadowNone].join(' ')}>
        { showPinned && <ChatConversationsListHeader title='PINNED CHATS' /> }
        { showPinned &&
          <ScrollableList
            scrollKey='chat-conversations-top'
            onLoadMore={this.handleLoadMore}
            onScrollToTop={noop}
          >
            {
              pinnedChatConversationIds.map((chatConversationId, i) => (
                <ChatConversationsListItem
                  key={`chat-conversation-pinned-${chatConversationId}`}
                  chatConversationId={chatConversationId}
                  source={source}
                />
              ))
            }
          </ScrollableList>
        }
        <ChatConversationsListHeader title={topTitle} />
        <ScrollableList
          scrollKey='chat-conversations-all'
          onLoadMore={this.handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
          showLoading={isLoading && chatConversationIds.size === 0}
          placeholderComponent={AccountPlaceholder}
          onScrollToTop={noop}
          placeholderCount={3}
          emptyMessage='Empty'
        >
          {
            chatConversationIds.map((chatConversationId, i) => (
              <ChatConversationsListItem
                key={`chat-conversation-${chatConversationId}`}
                chatConversationId={chatConversationId}
                source={source}
              />
            ))
          }
        </ScrollableList>
      </div>
    )
  }

}

const mapStateToProps = (state, { source }) => {
  let chatConversationIds, pinnedChatConversationIds = ImmutableList()
  const chatSearchValue = state.getIn(['chats', 'searchValue'], '')
  if (source === 'approved') {
    if (!!chatSearchValue && chatSearchValue.length > 0) {
      chatConversationIds = state.getIn(['chat_conversation_lists', 'approved_search', 'items'])
    } else {
      pinnedChatConversationIds = state.getIn(['chat_conversation_lists', 'approved_pinned', 'items'])
      chatConversationIds = state.getIn(['chat_conversation_lists', source, 'items'])
    }
  } else {
    chatConversationIds = state.getIn(['chat_conversation_lists', source, 'items'])
  }

  return {
    pinnedChatConversationIds,
    chatConversationIds,
    isSearching: !!chatSearchValue,
    hasMore: !!state.getIn(['chat_conversation_lists', source, 'next']),
    isLoading: state.getIn(['chat_conversation_lists', source, 'isLoading']),
  }
}

const mapDispatchToProps = (dispatch) => ({
  onFetchChatConversations(source, params) {
    if (source ==='approved') {
      dispatch(fetchChatConversations(params))
    } else if (source ==='requested') {
      dispatch(fetchChatConversationRequested())
    } else if (source ==='muted') {
      dispatch(fetchChatConversationMuted())
    }
  },
  onExpandChatConversations(source) {
    if (source ==='approved') {
      dispatch(expandChatConversations())
    } else if (source ==='requested') {
      dispatch(expandChatConversationRequested())
    } else if (source ==='muted') {
      dispatch(expandChatConversationMuted())
    }
  },
})

ChatConversationsList.propTypes = {
  chatConversationIds: ImmutablePropTypes.list,
  hasMore: PropTypes.bool,
  isLoading: PropTypes.bool,
  onFetchChatConversations: PropTypes.func.isRequired,
  onExpandChatConversations: PropTypes.func.isRequired,
  source: PropTypes.string.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatConversationsList)
