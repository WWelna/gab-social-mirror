import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { List as ImmutableList } from 'immutable'
import { FormattedMessage } from 'react-intl'
import throttle from 'lodash.throttle'
import { loggedIn, loggedOut, isPro, proWantsAds } from '../initial_state'
import {
  TIMELINE_INJECTION_FEATURED_GROUPS,
  TIMELINE_INJECTION_GROUP_CATEGORIES,
  TIMELINE_INJECTION_USER_SUGGESTIONS,
  TIMELINES_MAX_QUEUE_ITEMS,
} from '../constants'
import {
  timelineFetchPaged,
  timelineFetchPins,
  timelineDequeue,
  timelineUnloaded,
} from '../store/timelines'
import {
  SignUpPanel,
  GabAdStatus,
} from '../features/ui/util/async_components'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import { fetchStatus, fetchContext } from '../actions/statuses'
import StatusContainer from '../containers/status_container'
import StatusPlaceholder from './placeholder/status_placeholder'
import ScrollableList from './scrollable_list'
import Comment from './comment'
import Text from './text'
import TimelineQueueButtonHeader from './timeline_queue_button_header'
import TimelineInjectionBase from './timeline_injections/timeline_injection_base'
import TimelineInjectionRoot from './timeline_injections/timeline_injection_root'

const defaultEmptyMessage = (
  <FormattedMessage
    id='timelines.empty'
    defaultMessage='There are no gabs to display.'
  />
)

/**
 * ⚠️ These constants are sometimes {} maybe due to loading modules. It's
 * wrapped in a function hoping we can get the string values after load.
 * @returns {array}
 */
const getEmptySuggestions = () =>
  [
    <TimelineInjectionRoot
      key='empty-injection-0'
      type={TIMELINE_INJECTION_USER_SUGGESTIONS}
    />,
    <TimelineInjectionRoot
      key='empty-injection-1'
      type={TIMELINE_INJECTION_FEATURED_GROUPS}
    />,
    <TimelineInjectionRoot
      key='empty-injection-2'
      type={TIMELINE_INJECTION_USER_SUGGESTIONS}
      props={{ suggestionType:'verified' }}
    />,
    <TimelineInjectionRoot
      key='empty-injection-3'
      type={TIMELINE_INJECTION_GROUP_CATEGORIES}
    />,
  ]

class StatusList extends ImmutablePureComponent {

  state = {
    loadedFirstTime: false,
    isRefreshing: false,
    fetchedContext: false,
  }

  componentDidMount() {
    const { isFetched, statusIds, queuedItems } = this.props

    // condition met when a user hits the back button 
    if (statusIds && statusIds.size > 0) {
      // bail out to avoid user complaints about losing their scrollY position after navigating back 
      // (e.g., gab.com/groups -> scroll down and click comment -> scroll down -> navigate back)
      return
    }

    // when loading a timeline already in memory we can show what is available
    // and start queueing new items and prevent scroll jump.
    const queueResults = isFetched &&
      statusIds &&
      statusIds.size > 0 &&
      this.shouldQueue

    this.loadPins()
    this.load({ queueResults })

    // : hack :
    // if index is 0 or 1 and is comment, preload context
    if (statusIds && !this.state.fetchedContext) {
      const firstStatusId = statusIds.get(0)
      const secondStatusId = statusIds.get(1)
      const arr = []
      if (!!firstStatusId) arr.push(firstStatusId)
      if (!!secondStatusId) arr.push(secondStatusId)
      if (arr.length > 0) this.fetchContextsForInitialStatuses(arr)
    }
  }

  componentWillUnmount() {
    this.unscheduleQueue()
    this.props.onTimelineUnloaded()
  }

  componentDidUpdate(prevProps) {
    const {  isLoading, isFetched } = this.props
    const needsLoad = prevProps.isFetched && !isFetched && !isLoading
    const timelineChange = typeof prevProps.timelineId === 'string' &&
      typeof this.props.timelineId === 'string' &&
      prevProps.timelineId !== this.props.timelineId
    if (needsLoad || timelineChange) {
      this.load()
    }
  }

  loadPins = () => {
    const { showPins, endpoint, pinsEndpoint } = this.props
    if (showPins) {
      const pinOpts = { endpoint, pinsEndpoint }
      this.props.onTimelineFetchPins(pinOpts)
    }
  }

  load = throttle((opts = {}) => {
    const maxId = typeof opts === 'number' ? opts : undefined
    if (typeof this.props.onLoadMore === 'function') {
      // loading is handled by the parent
      this.props.onLoadMore(maxId)
      return
    }
    const {
      isComments,
      maxPages,
      endpoint,
      pinsEndpoint,
      sorts,
      topSorts,
      createParams,
      limit,
    } = this.props

    const { queueResults } = opts
    const expandOpts = {
      isComments,
      maxPages,
      endpoint,
      pinsEndpoint,
      sorts,
      topSorts,
      createParams,
      queueResults,
      limit,
    }
    this.props.onTimelineFetchPaged(expandOpts)
    this.rescheduleQueue()
  }, 300, { leading: true })

  refresh = () => {
    const { queuedItems } = this.props
    if (queuedItems.size > 0) {
      return this.props.onTimelineDequeue()
    }
    if (this.shouldQueue) {
      return this.loadQueue({ dequeue: true })
    }
    this.load()
  }

  unscheduleQueue = () => {
    if (this.queueTimer !== undefined) {
      clearInterval(this.queueTimer)
      this.queueTimer = undefined
    }
  }

  getSortByKey = key => (this.props.sorts || []).find(item => item.key === key)

  get shouldQueue() {
    const { queue, queuedItems, hasPrev, sortByValue } = this.props
    const sort = this.getSortByKey(sortByValue)
    return queue &&
      hasPrev &&
      (sort === undefined || sort.queue) &&
      queuedItems.size < TIMELINES_MAX_QUEUE_ITEMS
  }

  loadQueue = opts => {
    if (this.shouldQueue) {
      const dequeueResults = opts && opts.dequeue
      this.load({ queueResults: true, dequeueResults })
    }
  }

  rescheduleQueue = () => {
    this.unscheduleQueue()
    this.queueTimer = setInterval(this.loadQueue, 30000) // 30sec
  }

  fetchContextsForInitialStatuses = (statusIds) => {
    for (let i = 0; i < statusIds.length; i++) {
      const statusId = statusIds[i]
      this.props.onFetchContext(statusId)
    }
    this.setState({ fetchedContext: true })
  }

  getStatusIndex = (id, featured) => {
    const { pins, statusIds } = this.props
    if (featured) {
      return pins.indexOf(id)
    }
    return statusIds.indexOf(id) + this.props.pins.size
  }

  handleMoveUp = (id, featured) => {
    const elementIndex = this.getStatusIndex(id, featured) - 1
    this._selectChild(elementIndex, true)
  }

  handleMoveDown = (id, featured) => {
    const elementIndex = this.getStatusIndex(id, featured) + 1
    this._selectChild(elementIndex, false)
  }

  _selectChild(index, align_top) {
    const container = this.node.node
    const element = container
      .querySelector(`article:nth-of-type(${index + 1}) .focusable`)

    if (!element) {
      return
    }

    const top = container.scrollTop + container.clientHeight
    const bottom = element.offsetTop + element.offsetHeight

    if (align_top && container.scrollTop > element.offsetTop) {
      element.scrollIntoView(true)
    } else if (!align_top && top < bottom) {
      element.scrollIntoView(false)
    }
    element.focus()
  }

  setRef = c =>  this.node = c

  render() {
    const {
      pins = ImmutableList(),
      statusIds = ImmutableList(),
      queuedItems = ImmutableList(),
      timelineId,
      isLoading,
      isFetched,
      scrollKey,
      hasNext,
      emptyMessage,
      promotions = [],
      isComments,
      showPromoted,
      showInjections,
      showEmptyInjections,
      showAds,
      paginationLoggedIn,
      page,
      maxPages,
    } = this.props

    const { isRefreshing } = this.state

    let scrollableContent = []
      .concat(pins.toJS().map((statusId, index) =>
        (<StatusContainer
          key={`pin-${statusId}-${index}`}
          id={statusId}
          isFeatured
          onMoveUp={this.handleMoveUp}
          onMoveDown={this.handleMoveDown}
          contextType={timelineId}
          scrollKey={scrollKey}
          commentsLimited
        />)))
      .concat(statusIds.toJS()
        // care is taken to deduplicate on the redux side but due to asynchrony
        // they can still contain the same ids. this will remove them.
        .filter(statusId => pins.indexOf(statusId) === -1)
        .map((statusId, index) => (
          isComments ?
            <Comment
              isDetached
              key={`comment-${statusId}-${index}`}
              id={statusId}
              ancestorAccountId={1}
            /> :
            <StatusContainer
              key={`status-${statusId}-${index}`}
              id={statusId}
              onMoveUp={this.handleMoveUp}
              onMoveDown={this.handleMoveDown}
              scrollKey={scrollKey}
              contextType={timelineId}
              commentsLimited
            />
        )))

    const hasStatuses = scrollableContent.length> 0

    if (showPromoted && Array.isArray(promotions) && hasStatuses) {
      //
      // intersperse promoted statuses
      //
      scrollableContent = scrollableContent.reduce(function(acm, item, index) {
        const promotion = promotions.find(promotion =>
          promotion.position === index && promotion.timeline_id === timelineId
        )
        if (promotion) {
          acm.push(promotion)
        }
        acm.push(item)
        return acm
      }, [])
    }

    if (showInjections && hasStatuses) {
      //
      // intersperse timeline injections, suggestions, who to follow
      //
      scrollableContent = scrollableContent.reduce(function(acm, item, index) {
        if (index !== 0 && index % 7 === 0) {
          acm.push(
            <TimelineInjectionBase
              key={`timeline-injection-${index}`}
              index={index}
            />
          )
        }
        acm.push(item)
        return acm
      }, [])
    }

    if (showAds && (!isPro || proWantsAds) && !isComments && hasStatuses) {
      //
      // intersperse ads
      //
      scrollableContent = scrollableContent.reduce(function(acm, item, index) {
        if (index !== 0 && index % 7 === 0) {
          acm.push(
            <WrappedBundle
              key={`gab-ad-status-timeline-injection-${index}`}
              component={GabAdStatus}
              componentParams={{ pageKey: timelineId, position: index }}
            />
          )
        }
        acm.push(item)
        return acm
      }, [])
    }

    const sizesZero = statusIds.size === 0 &&
      queuedItems.size === 0 &&
      pins.size === 0
    const busy = isLoading || !isFetched || isRefreshing
    const paginationAllowed = paginationLoggedIn ? loggedIn : true

    // client-side enforced max pages
    const atMaxPage = typeof maxPages === 'number' &&
      typeof page === 'number' &&
      page >= maxPages

    const hasMore = typeof page === 'number' &&
      paginationAllowed &&
      hasNext &&
      !atMaxPage

    return (
      <div className={_s.posRel}>
        <TimelineQueueButtonHeader
          onClick={this.props.onTimelineDequeue}
          count={queuedItems.size}
          itemType='gab'
          top='calc(-1em)'
        />        
        <ScrollableList
          scrollRef={this.setRef}
          isLoading={busy}
          showLoading={busy && sizesZero}
          onLoadMore={this.load}
          placeholderComponent={StatusPlaceholder}
          placeholderCount={3}
          scrollKey={scrollKey || timelineId}
          hasMore={hasMore}
          emptyMessage={emptyMessage || defaultEmptyMessage}
        >
          {scrollableContent}
        </ScrollableList>
        {
          (showEmptyInjections && loggedIn) &&
          <div className={[_s.d, _s.mt15, _s.w100PC].join(' ')}>
            {getEmptySuggestions()}
          </div>
        }
        {
          loggedOut &&
          <div className={[_s.d, _s.w100PC, _s.mt5, _s.aiCenter].join(' ')}>
            <Text className={_s.py15} color='tertiary'>• • •</Text>
            <div className={[_s.d, _s.w100PC].join(' ')}>
              <WrappedBundle component={SignUpPanel} />
            </div>
          </div>
        }
      </div>
    )
  }

}

const mapStateToProps = (state, { timelineId }) => {
  const timeline = state.getIn(['timelines', timelineId])
  if (timeline === undefined) {
    // it hasn't called `load` yet
    return { isLoading: true }
  }
  return {
    statusIds: timeline.get('items'),
    queuedItems: timeline.get('queuedItems'),
    pins: timeline.get('pins'),
    isLoading: timeline.get('isLoading'),
    isFetched: timeline.get('isFetched'),
    hasNext: timeline.get('hasNext'),
    hasPrev: timeline.get('hasPrev'),
    sortByValue: timeline.get('sortByValue'),
    sortByTopValue: timeline.get('sortByTopValue'),
    page: timeline.get('page'),
    promotions: state.get('promotions'),
  }
}

const mapDispatchToProps = (dispatch, { timelineId }) => ({
  onTimelineFetchPaged(opts) {
    dispatch(timelineFetchPaged(timelineId, opts))
  },
  onTimelineFetchPins(opts) {
    dispatch(timelineFetchPins(timelineId, opts))
  },
  onTimelineDequeue() {
    dispatch(timelineDequeue(timelineId))
  },
  onFetchContext(statusId) {
    dispatch(fetchContext(statusId, true))
  },
  onFetchStatus(statusId) {
    dispatch(fetchStatus(statusId))
  },
  onTimelineUnloaded() {
    dispatch(timelineUnloaded(timelineId))
  },
})

StatusList.propTypes = {
  timelineId: PropTypes.string.isRequired,
  scrollKey: PropTypes.string,
  onLoadMore: PropTypes.func,
  isComments: PropTypes.bool,
  emptyMessage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  errorMessage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  showPins: PropTypes.bool,
  showPromoted: PropTypes.bool,
  showAds: PropTypes.bool,
  showInjections: PropTypes.bool,
  showEmptyInjections: PropTypes.bool,
  queue: PropTypes.bool,
  maxPages: PropTypes.number,
  endpoint: PropTypes.string,
  pinsEndpoint: PropTypes.string,
  paginationLoggedIn: PropTypes.bool,
  limit: PropTypes.number,
  // from redux state
  statusIds: ImmutablePropTypes.list,
  queuedItems: ImmutablePropTypes.list,
  pins: ImmutablePropTypes.list,
  isLoading: PropTypes.bool,
  isFetched: PropTypes.bool,
  sortByValue: PropTypes.string,
  sortByTopValue: PropTypes.string,
  hasNext: PropTypes.bool,
  hasPrev: PropTypes.bool,
  promotions: PropTypes.array,
  sorts: PropTypes.array,
  topSorts: PropTypes.array,
  createParams: PropTypes.func,
  page: PropTypes.number,
  // dispatch
  onTimelineFetchPaged: PropTypes.func,
  onTimelinePins: PropTypes.func,
  onTimelineDequeue: PropTypes.func,
  onFetchContext: PropTypes.func,
  onFetchStatus: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusList)
