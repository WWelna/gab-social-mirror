import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import debounce from 'lodash/debounce'
import { defineMessages, injectIntl } from 'react-intl'
import {
  fetchFollowing,
  expandFollowing,
} from '../actions/accounts'
import { me } from '../initial_state'
import Account from '../components/account'
import ScrollableList from '../components/scrollable_list'
import Block from '../components/block'
import BlockHeading from '../components/block_heading'
import AccountPlaceholder from '../components/placeholder/account_placeholder'
import Text from '../components/text'

class Following extends ImmutablePureComponent {

  componentDidMount() {
    const { accountId } = this.props

    if (!!accountId && accountId !== -1) {
      this.props.dispatch(fetchFollowing(accountId))
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!!nextProps.accountId && nextProps.accountId !== -1 && nextProps.accountId !== this.props.accountId) {
      this.props.dispatch(fetchFollowing(nextProps.accountId))
    }
  }

  handleLoadMore = debounce(() => {
    const { accountId } = this.props
    if (!!accountId && accountId !== -1) {
      this.props.dispatch(expandFollowing(accountId))
    }
  }, 300, { leading: true })

  render() {
    const {
      account,
      accountIds,
      hasMore,
      intl,
      isLoading,
    } = this.props

    return (
      <Block>
        <BlockHeading title={intl.formatMessage(messages.follows)} />
        {
          account && account.get('is_verified') && accountIds && accountIds.size > 0 && account.get('id') != me &&
          <div className={[_s.d, _s.px15, _s.py10, _s.mb10].join(' ')}>
            <Text align='center' size='medium' className={_s.mt10}>Only showing verified users</Text>
          </div>
        }
        <ScrollableList
          scrollKey='following'
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={this.handleLoadMore}
          placeholderComponent={AccountPlaceholder}
          placeholderCount={4}
          emptyMessage={account && account.get('following_count') ? 'This user is not sharing their network.' : intl.formatMessage(messages.empty)}
        >
          {
            account && accountIds && accountIds.map((id) => (
              <Account key={`following-${id}`} id={id} compact withBio />
            ))
          }
        </ScrollableList>
      </Block>
    )
  }

}

const mapStateToProps = (state, { account }) => {
  const accountId = !!account ? account.get('id') : -1

  return {

    accountId,
    accountIds: state.getIn(['user_lists', 'following', accountId, 'items']),
    hasMore: !!state.getIn(['user_lists', 'following', accountId, 'next']),
    isLoading: state.getIn(['user_lists', 'following', accountId, 'isLoading'], true),
  }
}

const messages = defineMessages({
  follows: { id: 'account.follows', defaultMessage: 'Following' },
  empty: { id: 'account.follows.empty', defaultMessage: 'This user doesn\'t follow anyone yet.' },
})

Following.propTypes = {
  intl: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  accountIds: ImmutablePropTypes.list,
  account: ImmutablePropTypes.map,
  accountId: PropTypes.string,
  hasMore: PropTypes.bool,
  isLoading: PropTypes.bool,
}

export default injectIntl(connect(mapStateToProps)(Following))
