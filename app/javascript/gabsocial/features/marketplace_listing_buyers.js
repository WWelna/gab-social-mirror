import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import debounce from 'lodash/debounce'
import noop from 'lodash/noop'
import { me } from '../initial_state'
import {
  fetchMarketplaceListingBuyers,
  expandMarketplaceListingBuyers,
} from '../actions/marketplace_listings'
import ColumnIndicator from '../components/column_indicator'
import ScrollableList from '../components/scrollable_list'
import AccountPlaceholder from '../components/placeholder/account_placeholder'
import ChatConversationsListItem from '../features/messages/components/chat_conversations_list_item'

class MarketplaceListingBuyers extends ImmutablePureComponent {

  componentDidMount () {
    this.props.dispatch(fetchMarketplaceListingBuyers(this.props.marketplaceListingId))
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.marketplaceListingId !== this.props.marketplaceListingId && nextProps.marketplaceListingId) {
      this.props.dispatch(fetchMarketplaceListingBuyers(nextProps.marketplaceListingId))
    }
  }

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandMarketplaceListingBuyers(this.props.marketplaceListingId))
  }, 300, { leading: true })

  render () {
    const {
      isOwner,
      chatConversationIds,
      isLoading,
      hasMore,
      marketplaceListingId,
    } = this.props

    if (!marketplaceListingId || !isOwner) return <ColumnIndicator type='missing' />

    return (
      <div className={[_s.d, _s.w100PC, _s.overflowHidden, _s.boxShadowNone].join(' ')}>
        <ScrollableList
          scrollKey='chat-conversations-all'
          onLoadMore={this.handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
          showLoading={isLoading && (chatConversationIds !== undefined && chatConversationIds.size === 0)}
          placeholderComponent={AccountPlaceholder}
          onScrollToTop={noop}
          placeholderCount={3}
          emptyMessage='No messages yet'
        >
          {
            chatConversationIds && 
            chatConversationIds.map((chatConversationId) => (
              <ChatConversationsListItem
                key={`marketplace-listing-${marketplaceListingId}-chat-conversation-${chatConversationId}`}
                chatConversationId={chatConversationId}
                maxTextLength={120}
              />
            ))
          }
        </ScrollableList>
      </div>
    )
  }

}

const mapStateToProps = (state, { marketplaceListingId }) => {
  const item = state.getIn(['marketplace_listings', `${marketplaceListingId}`], null)

  return {
    isOwner: !!item ? item.getIn(['account', 'id']) === me : false,
    chatConversationIds: state.getIn(['chat_conversation_lists', 'marketplace_listing_buyer', marketplaceListingId,'items']),
    hasMore: !!state.getIn(['chat_conversation_lists', 'marketplace_listing_buyer', marketplaceListingId, 'next']),
    isLoading: state.getIn(['chat_conversation_lists', 'marketplace_listing_buyer', marketplaceListingId, 'isLoading']),
  }
}

MarketplaceListingBuyers.propTypes = {
  chatConversationIds: ImmutablePropTypes.list,
  dispatch: PropTypes.func.isRequired,
  marketplaceListingId: PropTypes.string.isRequired,
  hasMore: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default connect(mapStateToProps)(MarketplaceListingBuyers)
