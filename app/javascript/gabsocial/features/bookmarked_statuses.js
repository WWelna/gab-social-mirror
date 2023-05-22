import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { FormattedMessage } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import debounce from 'lodash.debounce'
import {
  fetchBookmarkCollections,
  fetchBookmarkedStatuses,
  expandBookmarkedStatuses,
} from '../actions/bookmarks'
import { openModal } from '../actions/modal'
import { me, meUsername } from '../initial_state'
import {
  MODAL_BOOKMARK_COLLECTION_EDIT,
} from '../constants'
import StatusList from '../components/status_list'
import ColumnIndicator from '../components/column_indicator'
import Block from '../components/block'
import Button from '../components/button'
import Text from '../components/text'

class BookmarkedStatuses extends ImmutablePureComponent {

  componentDidMount() {
    const { dispatch, bookmarkCollectionsFetched, bookmarkCollectionId } = this.props
    if (!bookmarkCollectionsFetched || bookmarkCollectionId === 'saved') {
      dispatch(fetchBookmarkCollections())
    }
    dispatch(fetchBookmarkedStatuses(bookmarkCollectionId))
  }

  componentDidUpdate(prevProps) {
    const { dispatch, bookmarkCollectionsFetched, bookmarkCollectionId } = this.props
    // if (prevProps.bookmarkCollectionId === this.props.bookmarkCollectionId || !bookmarkCollectionsFetched) {
    //   dispatch(fetchBookmarkCollections())
    // }
    // if (prevProps.bookmarkCollectionId === this.props.bookmarkCollectionId) {
    //   dispatch(fetchBookmarkedStatuses(this.props.bookmarkCollectionId))
    // }
  }
  
  handleOnOpenEdit = () => {
    const { bookmarkCollectionId, dispatch } = this.props
    dispatch(openModal(MODAL_BOOKMARK_COLLECTION_EDIT, {
      bookmarkCollectionId,
    }))
  }

  handleLoadMore = debounce(() => {
    const { bookmarkCollectionId, dispatch } = this.props
    dispatch(expandBookmarkedStatuses(bookmarkCollectionId))
  }, 300, { leading: true })

  render() {
    const {
      statusIds,
      hasMore,
      isLoading,
      isMyAccount,
      isMyBookmark,
      bookmarkCollection,
      bookmarkCollectionId,
      bookmarkCollectionTitle,
    } = this.props

    if (
      !isMyAccount || 
      (bookmarkCollectionId !== 'saved' && !isMyBookmark) ||
      (bookmarkCollectionId !== 'saved' && !bookmarkCollection)
      ) {
      return <ColumnIndicator type='missing' />
    }

    return (
      <div className={[_s.d, _s.w100PC].join(' ')}>
        <Block>
          <div className={[_s.d, _s.px15, _s.py10].join(' ')}>
            <div className={[_s.d, _s.flexRow, _s.aiCenter].join(' ')}>
              <Text size='extraLarge' weight='bold'>
                {bookmarkCollectionTitle}
              </Text>
              {
                bookmarkCollectionId !== 'saved' &&
                <div className={[_s.d, _s.mlAuto].join(' ')}>
                  <Button
                    isText
                    radiusSmall
                    backgroundColor='none'
                    color='brand'
                    onClick={this.handleOnOpenEdit}
                    className={[_s.px15, _s.py5, _s.bgSubtle_onHover].join(' ')}
                  >
                    <Text color='inherit' weight='bold'>
                      Edit
                    </Text>
                  </Button>
                </div>
              }
            </div>
          </div>
        </Block>
        <div className={[_s.d, _s.w100PC, _s.mt10].join(' ')}>
          <StatusList
            statusIds={statusIds}
            scrollKey='bookmarked_statuses'
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={this.handleLoadMore}
            emptyMessage={<FormattedMessage id='empty_column.bookmarked_statuses' defaultMessage="You don't have any bookmarked gabs yet. If you are GabPRO, when you bookmark one, it will show up here." />}
          />
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state, { params: { username, bookmarkCollectionId } }) => {
  const bookmarkCollections = state.getIn(['bookmark_collections', 'items'])
  const bookmarkCollection = bookmarkCollections.find((b) => b.get('id') === bookmarkCollectionId)
  const bookmarkCollectionTitle = bookmarkCollectionId === 'saved' ? 'Saved' : !!bookmarkCollection ? bookmarkCollection.get('title') : null

  return {
    bookmarkCollection,
    bookmarkCollectionId,
    bookmarkCollectionTitle,
    isMyBookmark: !!bookmarkCollection ? bookmarkCollection.get('account_id') == me : false,
    isMyAccount: (username.toLowerCase() === meUsername.toLowerCase()),
    statusIds: state.getIn(['status_lists', 'bookmarks', bookmarkCollectionId, 'items']),
    isLoading: state.getIn(['status_lists', 'bookmarks', bookmarkCollectionId, 'isLoading'], true),
    hasMore: !!state.getIn(['status_lists', 'bookmarks', bookmarkCollectionId, 'next']),
    bookmarkCollectionsFetched: state.getIn(['bookmark_collections', 'isFetched'], false),
  }
}

BookmarkedStatuses.propTypes = {
  dispatch: PropTypes.func.isRequired,
  statusIds: ImmutablePropTypes.list.isRequired,
  hasMore: PropTypes.bool,
  isLoading: PropTypes.bool,
  bookmarkCollectionId: PropTypes.string,
  isMyAccount: PropTypes.bool.isRequired,
}

export default connect(mapStateToProps)(BookmarkedStatuses)
