import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { List as ImmutableList } from 'immutable'
import { injectIntl, defineMessages } from 'react-intl'
import { MODAL_COMPOSE } from '../constants'
import { expandAccountFeaturedTimeline, expandAccountTimeline } from '../actions/timelines'
import { openModal } from '../actions/modal'
import StatusList from '../components/status_list'
import Text from '../components/text'
import Button from '../components/button'
import { me } from '../initial_state'

class AccountTimeline extends ImmutablePureComponent {

  componentDidMount() {
    const { accountId, commentsOnly, isDeckConnected } = this.props

    if (accountId && accountId !== -1) {
      if (!commentsOnly && !isDeckConnected) {
        this.props.dispatch(expandAccountFeaturedTimeline(accountId))
      }

      this.props.dispatch(expandAccountTimeline(accountId, { commentsOnly }))
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.accountId && nextProps.accountId !== -1 && (nextProps.accountId !== this.props.accountId && nextProps.accountId) || nextProps.commentsOnly !== this.props.commentsOnly) {
      if (!nextProps.commentsOnly && !nextProps.isDeckConnected) {
        this.props.dispatch(expandAccountFeaturedTimeline(nextProps.accountId))
      }

      this.props.dispatch(expandAccountTimeline(nextProps.accountId, { commentsOnly: nextProps.commentsOnly }))
    }
  }

  handleLoadMore = (maxId) => {
    if (this.props.accountId && this.props.accountId !== -1) {
      this.props.dispatch(expandAccountTimeline(this.props.accountId, {
        maxId,
        commentsOnly: this.props.commentsOnly
      }))
    }
  }

  handleOnOpenComposeModal = () => {
    this.props.dispatch(openModal(MODAL_COMPOSE))
  }

  render() {
    const {
      statusIds,
      featuredStatusIds,
      isLoading,
      hasMore,
      intl,
      isMe,
    } = this.props

    const emptyMessage = (
      <div className={[_s.d, _s.w100PC, _s.aiCenter, _s.jcCenter].join(' ')}>
        <Text>{intl.formatMessage(messages.empty)}</Text>
        {
          isMe &&
          <Button
            className={[_s.d, _s.mt15].join(' ')}
            onClick={this.handleOnOpenComposeModal}
          >
            Create a gab
          </Button>
        }
      </div>
    )

    var canSee = true;
    const blocks = !!me ? localStorage.getItem('blocks') : ''
    const mutes = !!me ? localStorage.getItem('mutes') : ''
    const blockedby = !!me ? localStorage.getItem('blockedby') : ''
    if (
      !!me && (
        (blockedby && blockedby.split(',').includes(this.props.accountId))
        ||
        (blocks && blocks.split(',').includes(this.props.accountId))
        ||
        (mutes && mutes.split(',').includes(this.props.accountId))
      )
    ) {
      canSee = false;
    }

    return (
      <StatusList
        scrollKey='account_timeline'
        statusIds={statusIds}
        featuredStatusIds={featuredStatusIds}
        isLoading={isLoading}
        hasMore={hasMore && canSee}
        onLoadMore={this.handleLoadMore}
        emptyMessage={emptyMessage}
      />
    )
  }

}

const messages = defineMessages({
  empty: { id: 'empty_column.account_timeline', defaultMessage: 'No gabs here!' },
})

const emptyList = ImmutableList()

const mapStateToProps = (state, { id, account, commentsOnly = false }) => {
  const accountId = !!id ? id : !!account ? account.getIn(['id'], null) : -1
  const path = commentsOnly ? `${accountId}:comments_only` : accountId

  return {
    accountId,
    isDeckConnected: state.getIn(['deck', 'connected'], false),
    statusIds: state.getIn(['timelines', `account:${path}`, 'items'], emptyList),
    featuredStatusIds: commentsOnly ? ImmutableList() : state.getIn(['timelines', `account:${accountId}:pinned`, 'items'], emptyList),
    isLoading: state.getIn(['timelines', `account:${path}`, 'isLoading'], true),
    hasMore: state.getIn(['timelines', `account:${path}`, 'hasMore']),
  }
}

AccountTimeline.propTypes = {
  params: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  statusIds: ImmutablePropTypes.list,
  featuredStatusIds: ImmutablePropTypes.list,
  isLoading: PropTypes.bool,
  hasMore: PropTypes.bool,
  commentsOnly: PropTypes.bool,
  isDeckConnected: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  isMe: PropTypes.bool.isRequired,
}

export default injectIntl(connect(mapStateToProps)(AccountTimeline))
