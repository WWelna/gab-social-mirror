import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { FormattedMessage } from 'react-intl'
import debounce from 'lodash/debounce'
import { fetchQuotes, expandQuotes } from '../actions/interactions'
import { fetchStatus } from '../actions/statuses'
import { makeGetStatus } from '../selectors'
import Status from '../components/status'
import ColumnIndicator from '../components/column_indicator'
import ScrollableList from '../components/scrollable_list'
import StatusPlaceholder from '../components/placeholder/status_placeholder'
import StatusContainer from '../containers/status_container'

class StatusQuotes extends ImmutablePureComponent {

  componentDidMount () {
    this.props.dispatch(fetchQuotes(this.props.statusId))
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.statusId !== this.props.statusId && nextProps.statusId) {
      this.props.dispatch(fetchQuotes(nextProps.statusId))
    }
  }

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandQuotes(this.props.statusId))
  }, 1000, { leading: true })

  render () {
    const {
      quoteIds,
      isLoading,
      hasMore,
      list,
      statusId,
    } = this.props

    if (!statusId) {
      return <ColumnIndicator type='missing' />
    }

    const quoteIdCount = !!quoteIds ? quoteIds.count() : 0

    return (
      <ScrollableList
        scrollKey='quotes'
        emptyMessage={<FormattedMessage id='status.reposts.empty' defaultMessage='No one has quote posted this gab yet. When someone does, they will show up here.' />}
        onLoadMore={this.handleLoadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        showLoading={isLoading && quoteIdCount === 0}
        placeholderComponent={StatusPlaceholder}
        placeholderCount={1}
      >
        {
          quoteIdCount > 0 && quoteIds.map((status) => (
            <StatusContainer
              contextType='notification'
              key={`quotes-${status}`}
              id={status}
              isNotification
              isQuoteHidden
            />
          ))
        }
      </ScrollableList>
    )
  }

}

const mapStateToProps = (state, props) => {
  const statusId = props.params ? props.params.statusId : props.statusId
  return {
    quoteIds: state.getIn(['status_lists', 'quotes_for', statusId, 'items']),
    hasMore: !!state.getIn(['status_lists', 'quotes_for', statusId, 'next']),
    isLoading: state.getIn(['status_lists', 'quotes_for', statusId, 'isLoading']),
  }
}

StatusQuotes.propTypes = {
  quoteIds: ImmutablePropTypes.list,
  dispatch: PropTypes.func.isRequired,
  statusId: PropTypes.string.isRequired,
}

export default connect(mapStateToProps)(StatusQuotes)
