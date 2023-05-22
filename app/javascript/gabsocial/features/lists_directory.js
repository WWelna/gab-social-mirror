import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { getOrderedLists } from '../selectors'
import { fetchLists } from '../actions/lists'
import { openModal } from '../actions/modal'
import { openPopover } from '../actions/popover'
import {
  MODAL_LIST_CREATE,
  POPOVER_LISTS_SORT_OPTIONS,
  BREAKPOINT_EXTRA_SMALL,
  LIST_TYPE_OWN,
  LIST_TYPE_MEMBER_OF,
  LIST_TYPE_SUBSCRIBED_TO,
  LIST_TYPE_FEATURED,
} from '../constants'
import { me } from '../initial_state'
import List from '../components/list'
import Text from '../components/text'
import Block from '../components/block'
import Heading from '../components/heading'
import Button from '../components/button'
import Icon from '../components/icon'
import BlockHeading from '../components/block_heading'
import ResponsiveComponent from './ui/util/responsive_component'
import { parseQuerystring } from '../utils/querystring'

class ListsDirectory extends ImmutablePureComponent {

  state = {
    activeList: null,
    title: 'Featured Feeds'
  }

  componentDidMount() {
    this.checkCurrentUrlTab()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.key !== this.props.location.key &&
        prevProps.location.pathname === '/feeds' &&
        this.props.location.pathname === '/feeds'
      ) {
      this.checkCurrentUrlTab()
    }
  }

  handleOnOpenListCreateModal = () => {
    this.props.onOpenListCreateModal()
  }

  checkCurrentUrlTab = () => {
    // null/no tab is "featured" aka main landing page of /feeds
    const qp = parseQuerystring()
    const tab = qp.tab || LIST_TYPE_FEATURED
    if (this.state.currentTab !== tab) {
      this.setState({ currentTab: tab })
      this.handleOnChangeTab(tab)
    }
  }

  handleOnChangeTab(tab) {
    let title = this.state.title
    if (tab === LIST_TYPE_OWN) title = 'My Feeds'
    else if (tab === LIST_TYPE_MEMBER_OF) title = 'Member of'
    else if (tab === LIST_TYPE_SUBSCRIBED_TO) title = 'Subscribed To'
    else {
      title = 'Featured Feeds'
      tab = LIST_TYPE_FEATURED
    }
    this.setState({
      activeList: tab,
      title,
    })
    this.props.onFetchLists(tab)
  }

  handleOnSort(activeList) {
    this.props.onOpenListsSortPopover(this.sortNode, activeList)
  }

  setSortNode = (c) => {
    this.sortNode = c
  }

  render() {
    const {
      ownLists,
      memberOfLists,
      subscribedToLists,
      featuredLists,
      listsListsBlock,
    } = this.props 
    const { activeList, title } = this.state

    const isFetched = listsListsBlock.getIn([activeList, 'isFetched'], false)
    const isLoading = listsListsBlock.getIn([activeList, 'isLoading'], false)
    const isError = listsListsBlock.getIn([activeList, 'isError'], false)

    const emptyMessage = (
      <div className={[_s.d, _s.w100PC, _s.aiCenter, _s.py15, _s.px15, _s.jcCenter].join(' ')}>
        <Text>
          You don't have any feeds yet. When you create one, it will show up here.
        </Text>
        <Button
          className={[_s.d, _s.mt15].join(' ')}
          onClick={this.handleOnOpenListCreateModal}
        >
          Create a Feed
        </Button>
      </div>
    )
    
    const lists =
      activeList === LIST_TYPE_OWN ? ownLists :
      activeList === LIST_TYPE_MEMBER_OF ? memberOfLists :
      activeList === LIST_TYPE_SUBSCRIBED_TO ? subscribedToLists : featuredLists
    
    const listItems = lists.map((list) => {
      const owner = list.get('account')
      let subtitle = `Created by ${owner.get('id') === me ? 'you' : `@${owner.get('username')}`}`
      let visibility = list.get('visibility')
      let subCount = list.get('subscriber_count')
      let memCount = list.get('member_count')
      if (subCount > 0 && visibility === 'public') {
        subtitle += ` · ${list.get('subscriber_count')} subscriber${subCount === 0 || subCount > 1 ? 's' : ''}`
      }
      if (memCount > 0) {
        subtitle += ` · ${list.get('member_count')} member${memCount === 0 || memCount > 1 ? 's' : '' }`
      }

      return {
        to: `/feeds/${list.get('id')}`,
        title: (
          <span>
            <Icon id={visibility === 'private' ? 'lock' : 'globe'} size='12px' className={_s.pr5} />
            <Text size='medium' weight='bold'>{list.get('title')}</Text>
          </span>
        ),
        subtitle,
      }
    })

    return (
      <Block>
        <ResponsiveComponent min={BREAKPOINT_EXTRA_SMALL}>
          <div className={[_s.d, _s.minH53PX, _s.flexRow, _s.bgPrimary, _s.z3, _s.borderBottom1PX, _s.borderColorSecondary, _s.w100PC].join(' ')}>
            <div className={[_s.d, _s.flex1, _s.px15,, _s.jcCenter, _s.h100PC, _s.minH53PX].join(' ')}>
              <Heading size='h2'>
                {title}
              </Heading>
            </div>
            <div
              className={[_s.d, _s.mlAuto, _s.borderLeft1PX, _s.borderColorSecondary, _s.aiCenter, _s.jcCenter].join(' ')}
              ref={this.setSortNode}
            >
              <Button
                isText
                backgroundColor='none'
                color='brand'
                onClick={() => this.handleOnSort(activeList)}
                className={[_s.aiCenter, _s.jcCenter, _s.px15, _s.h53PX, _s.bgSubtle_onHover].join(' ')}
              >
                <Text color='inherit' weight='bold' className={_s.px10}>
                  Sort
                </Text>
              </Button>
            </div>
          </div>
        </ResponsiveComponent>
        <List
          scrollKey='lists'
          isLoading={isLoading}
          showLoading={(lists.size === 0 && !isFetched) || isLoading}
          items={listItems}
          emptyMessage="There are no featured feeds."
        />
        {
          (activeList === 'own' && lists.size === 0 && isFetched) && emptyMessage
        }
      </Block>
    )
  }

}

const mapDispatchToProps = (dispatch) => ({
  onFetchLists: (tab) => dispatch(fetchLists(tab)),
  onOpenListCreateModal: () => dispatch(openModal(MODAL_LIST_CREATE)),
  onOpenListsSortPopover(targetRef, tab) {
    dispatch(openPopover(POPOVER_LISTS_SORT_OPTIONS, {
      targetRef,
      position: 'bottom',
      tab,
    }))
  }
})

const mapStateToProps = (state) => ({
  listsListsBlock: state.getIn(['lists_lists']),
  ownLists: getOrderedLists(state, LIST_TYPE_OWN),
  memberOfLists: getOrderedLists(state, LIST_TYPE_MEMBER_OF),
  subscribedToLists: getOrderedLists(state, LIST_TYPE_SUBSCRIBED_TO),
  featuredLists: getOrderedLists(state, LIST_TYPE_FEATURED),
})

ListsDirectory.propTypes = {
  onFetchLists: PropTypes.func.isRequired,
  onOpenListCreateModal: PropTypes.func.isRequired,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ListsDirectory))
