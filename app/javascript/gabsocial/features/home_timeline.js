import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import throttle from 'lodash.throttle'
import {
  clearTimeline,
  expandHomeTimeline,
} from '../actions/timelines'
import StatusList from '../components/status_list'

class HomeTimeline extends React.PureComponent {
  constructor() {
    super();
    window.onpopstate = e => {
      this.setState({ backButtonPressed: true })
    }
  }

  state = {
    page: 1,
  }

  componentDidMount () {
    const { sortByValue } = this.props

    // add imperceptible delay to allow the component to detect whether 
    // it was launched via a backbutton (in which case we optimize by not refetching data)
    setTimeout(function () {
      if (!this.state || !this.state.backButtonPressed) {
        this.setState({ backButtonPressed: false })
        this.props.onExpandHomeTimeline({ sortByValue })
      }
    }.bind(this), 250)
  }

  componentDidUpdate (prevProps) {
    //Check if clicked on "home" button, if so, reload
    if (prevProps.location.key !== this.props.location.key &&
        prevProps.location.pathname === '/home' &&
        this.props.location.pathname === '/home') {
      this.handleReload()
    }

    if (prevProps.sortByValue !== this.props.sortByValue) {
      this.props.onClearTimeline()
      this.handleLoadMore()
    }
  }

  handleLoadMore = (maxId) => {
    const { sortByValue } = this.props

    const newPage = !!maxId ? this.state.page + 1 : 1
    this.setState({ page: newPage })

    this.props.onExpandHomeTimeline({ maxId, sortByValue, page: newPage })
  }

  handleReload = throttle(() => {
    const { sortByValue } = this.props
    this.props.onExpandHomeTimeline({ sortByValue })
  }, 5000)

  render () {
    const { intl } = this.props

    const emptyMessage = intl.formatMessage(messages.empty)
    
    return (
      <StatusList
        scrollKey='home_timeline'
        onLoadMore={this.handleLoadMore}
        timelineId='home'
        emptyMessage={emptyMessage}
      />
    )
  }

}

const messages = defineMessages({
  title: { id: 'column.home', defaultMessage: 'Home' },
  empty: { id: 'empty_timeline.home', defaultMessage: 'Your home timeline is empty. Start following other users to receive their content here.' },
})

const mapStateToProps = (state) => ({
  isPartial: state.getIn(['timelines', 'home', 'isPartial']),
  sortByValue: state.getIn(['timelines', 'home', 'sortByValue']),
})

const mapDispatchToProps = (dispatch) => ({
  onExpandHomeTimeline(options) {
    dispatch(expandHomeTimeline(options))
  },
  onClearTimeline() {
    dispatch(clearTimeline('home'))
  },
})

HomeTimeline.propTypes = {
  intl: PropTypes.object.isRequired,
  isPartial: PropTypes.bool,
  onExpandHomeTimeline: PropTypes.func.isRequired,
  onClearTimeline: PropTypes.func.isRequired,
  sortByValue: PropTypes.string,
}

export default injectIntl(withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeTimeline)))
