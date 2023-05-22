import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import debounce from 'lodash/debounce'
import { me } from '../initial_state'
import {
  fetchListMembers,
  expandListMembers,
} from '../actions/list_accounts'
import {
  leaveList,
  removeFromList,
} from '../actions/lists'
import Account from '../components/account'
import ColumnIndicator from '../components/column_indicator'
import ScrollableList from '../components/scrollable_list'
import AccountPlaceholder from '../components/placeholder/account_placeholder'

class ListMembers extends ImmutablePureComponent {

  componentDidMount () {
    this.props.dispatch(fetchListMembers(this.props.listId))
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.listId !== this.props.listId && nextProps.listId) {
      this.props.dispatch(fetchListMembers(nextProps.listId))
    }
  }

  handleOnRemoveAccountFromList = (account) => {
    if (!account) return

    const { listId, isListOwner, dispatch } = this.props
    const accountId = account.get('id')

    // if is list owner, remove
    // if is not list owner, leave
    if (isListOwner) {
      dispatch(removeFromList(listId, accountId))
    } else if (accountId === me && !isListOwner) {
      dispatch(leaveList(listId))
    } else {
      // error?
    }
  }

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandListMembers(this.props.listId))
  }, 300, { leading: true })

  render () {
    const {
      isListOwner,
      accountIds,
      isLoading,
      hasMore,
      listId,
    } = this.props

    if (!listId) return <ColumnIndicator type='missing' />

    const accountIdCount = !!accountIds ? accountIds.count() : 0

    return (
      <ScrollableList
        scrollKey='list_members'
        emptyMessage='This feed has zero members.'
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
                key={`list-${listId}-member-${id}`}
                id={id}
                onActionClick={isListOwner || id == me ? this.handleOnRemoveAccountFromList : null}
                actionIcon={isListOwner ? 'subtract' : null}
                actionTitle={(id == me && !isListOwner) ? 'Remove myself' : null}
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
  accountIds: state.getIn(['user_lists', 'list_members', listId, 'items']),
  hasMore: !!state.getIn(['user_lists', 'list_members', listId, 'next']),
  isLoading: state.getIn(['user_lists', 'list_members', listId, 'isLoading']),
})

ListMembers.propTypes = {
  accountIds: ImmutablePropTypes.list,
  dispatch: PropTypes.func.isRequired,
  listId: PropTypes.string.isRequired,
  hasMore: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool
}

export default connect(mapStateToProps)(ListMembers)
