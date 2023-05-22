import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { FormattedMessage } from 'react-intl'
import debounce from 'lodash/debounce'
import { fetchLikes, expandLikes } from '../actions/interactions'
import { CX } from '../constants'
import { shortNumberFormat } from '../utils/numbers'
import Account from '../components/account'
import ReactionTypeImage from '../components/reaction_type_image'
import Text from '../components/text'
import ColumnIndicator from '../components/column_indicator'
import ScrollableList from '../components/scrollable_list'
import AccountPlaceholder from '../components/placeholder/account_placeholder'
import { fetchStatusReactions } from '../actions/statuses'

const getStatusLikesTabClasses = (tab, activeTab) => CX({
  d: 1,
  h40PX: 1,
  px15: 1,
  aiCenter: 1,
  jcCenter: 1,
  outlineNone: 1,
  bgTransparent: 1,
  noUnderline: 1,
  cursorPointer: 1,
  borderBottom3PX: 1,
  flexRow: tab !== -1,
  bgSubtle_onHover: tab !== activeTab,
  borderColorTransparent: tab !== activeTab,
  borderColorBrand: tab === activeTab,
})

class StatusLikes extends ImmutablePureComponent {

  state = {
    activeTab: -1, // [-1 = all], [0,1 = normal like], [2-n = reaction]
  }

  componentDidMount () {
    if (this.props.statusId) {
      this.props.onFetchStatusReactions(this.props.statusId)
    }
    this.props.onFetchLikes(this.props.statusId, this.state.activeTab)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.statusId !== this.props.statusId && nextProps.statusId) {
      this.props.onFetchStatusReactions(nextProps.statusId)
      this.props.onFetchLikes(nextProps.statusId, this.state.activeTab)
    }
  }

  handleLoadMore = debounce(() => {
    this.props.onExpandLikes(this.props.statusId, this.state.activeTab)
  }, 300, { leading: true })

  handleOnChangeTab = (reactionId) => {
    this.setState({ activeTab: reactionId })
    this.props.onFetchLikes(this.props.statusId, reactionId)
  }

  render () {
    const { status, statusId, statusReactions } = this.props
    const { activeTab } = this.state
    const reactionsMap = status.get('reactions_counts')
  
    if (!statusId) {
      return <ColumnIndicator type='missing' />
    }

    const accountIds = !!statusReactions ? statusReactions.getIn([activeTab, 'items']) : null
    const accountIdCount = !!accountIds ? accountIds.count() : 0
    const hasMore = !!statusReactions ? !!statusReactions.getIn([activeTab, 'next']) : false
    const isLoading = !!statusReactions ? statusReactions.getIn([activeTab, 'isLoading']) : false

    return (
      <div className={[_s.d, _s.w100PC].join(' ')}>
        <div className={[_s.d, _s.h40PX, _s.px10, _s.w100PC, _s.borderBottom1PX, _s.borderColorSecondary, _s.flexRow, _s.aiCenter, _s.noScrollbar, _s.overflowXScroll].join(' ')}>
          <button
            className={getStatusLikesTabClasses(-1, activeTab)}
            onClick={() => this.handleOnChangeTab(-1)}
          >
            <Text weight='bold'>All</Text>
          </button>
          {
            !!reactionsMap && reactionsMap.map((block) => {
              const reactionId = block.get('reactionId')
              const count = block.get('count')
              return (
                <button
                  key={`status-${statusId}-reaction-${reactionId}`}
                  onClick={() => this.handleOnChangeTab(reactionId)}
                  className={getStatusLikesTabClasses(reactionId, activeTab)}
                >
                  <span>
                    <ReactionTypeImage reactionTypeId={reactionId} size='18px' />
                  </span>
                  <Text weight='medium' className={_s.ml7}>{shortNumberFormat(count)}</Text>
                </button>
              )
            })
          }
        </div>
        <ScrollableList
          scrollKey='likes'
          emptyMessage={<FormattedMessage id='status.likes.empty' defaultMessage='No one has liked this gab yet. When someone does, they will show up here.' />}
          onLoadMore={this.handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
          showLoading={isLoading && accountIdCount === 0}
          placeholderComponent={AccountPlaceholder}
          placeholderCount={3}
        >
          {
            !!accountIds && accountIds.map((id) => (
              <Account
                compact
                key={`liked-by-${id}`}
                id={id}
              />
            ))
          }
        </ScrollableList>
      </div>
    )
  }

}

const mapDispatchToProps = (dispatch) => ({
  onFetchStatusReactions(statusId) {
    dispatch(fetchStatusReactions(statusId))
  },
  onFetchLikes(statusId, activeTab) {
    dispatch(fetchLikes(statusId, activeTab))
  },
  onExpandLikes(statusId, activeTab) {
    dispatch(expandLikes(statusId, activeTab))
  },
})

const mapStateToProps = (state, props) => {
  const statusId = props.params ? props.params.statusId : props.statusId
  return {
    status: state.getIn(['statuses', statusId]),
    statusReactions: state.getIn(['user_lists', 'reactions', statusId]),
  }
}

StatusLikes.propTypes = {
  accountIds: ImmutablePropTypes.list,
  dispatch: PropTypes.func.isRequired,
  statusId: PropTypes.string.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusLikes)
