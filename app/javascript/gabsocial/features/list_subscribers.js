import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import debounce from 'lodash/debounce'
import { me } from '../initial_state'
import {
  fetchListSubscribers,
  expandListSubscribers,
} from '../actions/list_accounts'
import Account from '../components/account'
import ColumnIndicator from '../components/column_indicator'
import ScrollableList from '../components/scrollable_list'
import AccountPlaceholder from '../components/placeholder/account_placeholder'

class ListSubscribers extends ImmutablePureComponent {

  componentDidMount () {
    this.props.dispatch(fetchListSubscribers(this.props.listId))
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.listId !== this.props.listId && nextProps.listId) {
      this.props.dispatch(fetchListSubscribers(nextProps.listId))
    }
  }

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandListSubscribers(this.props.listId))
  }, 300, { leading: true })

  render () {
    const {
      isListOwner,
      accountIds,
      isLoading,
      hasMore,
      listId,
    } = this.props

    if (!listId || !isListOwner) return <ColumnIndicator type='missing' />

    const accountIdCount = !!accountIds ? accountIds.count() : 0

    return (
      <ScrollableList
        scrollKey='list_subscribers'
        emptyMessage='This feed has zero subscribers.'
        onLoadMore={this.handleLoadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        showLoading={isLoading && accountIdCount === 0}
        placeholderComponent={AccountPlaceholder}
        placeholderCount={3}
      >
        {
          accountIdCount > 0 && accountIds.map((id) => {
            return (
              <Account
                compact
                key={`list-${listId}-subscriber-${id}`}
                id={id}
              />
            )
          })
        }
      </ScrollableList>
    )
  }

}

const mapStateToProps = (state, { listId }) => ({
  isListOwner: state.getIn(['lists', 'items', listId, 'account', 'id'], null) === me,
  accountIds: state.getIn(['user_lists', 'list_subscribers', listId, 'items']),
  hasMore: !!state.getIn(['user_lists', 'list_subscribers', listId, 'next']),
  isLoading: state.getIn(['user_lists', 'list_subscribers', listId, 'isLoading']),
})

ListSubscribers.propTypes = {
  accountIds: ImmutablePropTypes.list,
  dispatch: PropTypes.func.isRequired,
  listId: PropTypes.string.isRequired,
  hasMore: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default connect(mapStateToProps)(ListSubscribers)
