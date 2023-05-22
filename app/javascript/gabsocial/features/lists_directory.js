import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
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
} from '../constants'
import { me } from '../initial_state'
import List from '../components/list'
import Text from '../components/text'
import Block from '../components/block'
import TabBar from '../components/tab_bar'
import Button from '../components/button'
import Icon from '../components/icon'
import ResponsiveComponent from './ui/util/responsive_component'

class ListsDirectory extends ImmutablePureComponent {

  state = {
    activeList: 'own',
  }

  componentDidMount() {
    this.props.onFetchLists()
  }

  handleOnOpenListCreateModal = () => {
    this.props.onOpenListCreateModal()
  }

  handleOnChangeTab(tab) {
    this.setState({ activeList: tab })
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
      isError,
      isFetched,
      isLoading,
    } = this.props 
    const { activeList } = this.state

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
    
    const lists = activeList === 'own' ? ownLists : activeList === 'member_of' ? memberOfLists : subscribedToLists

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
        <div className={[_s.d, _s.maxH56PX, _s.flexRow, _s.bgPrimary, _s.z3, _s.borderBottom1PX, _s.borderColorSecondary, _s.w100PC].join(' ')}>
          <div className={[_s.d, _s.flex1].join(' ')}>
            <TabBar
              isLarge
              tabs={[
                {
                  title: 'My Feeds',
                  onClick: () => this.handleOnChangeTab('own'),
                  active: activeList === 'own',
                },
                {
                  title: 'Subscribed to',
                  onClick: () => this.handleOnChangeTab('subscribed_to'),
                  active: activeList === 'subscribed_to',
                },
                {
                  title: 'Member of',
                  onClick: () => this.handleOnChangeTab('member_of'),
                  active: activeList === 'member_of',
                },
              ]}
            />
          </div>
          <ResponsiveComponent min={BREAKPOINT_EXTRA_SMALL}>
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
          </ResponsiveComponent>
        </div>
        <List
          scrollKey='lists'
          showLoading={lists.size === 0 && !isFetched}
          items={listItems}
        />
        {
          (activeList === 'own' && lists.size === 0 && isFetched) && emptyMessage
        }
      </Block>
    )
  }

}

const mapDispatchToProps = (dispatch) => ({
  onFetchLists: () => dispatch(fetchLists()),
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
  ownLists: getOrderedLists(state, 'own'),
  memberOfLists: getOrderedLists(state, 'member_of'),
  subscribedToLists: getOrderedLists(state, 'subscribed_to'),
  isLoading: state.getIn(['lists', 'isLoading']),
  isError: state.getIn(['lists', 'isError']),
  isFetched: state.getIn(['lists', 'isFetched']),
})

ListsDirectory.propTypes = {
  lists: ImmutablePropTypes.list,
  onFetchLists: PropTypes.func.isRequired,
  onOpenListCreateModal: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ListsDirectory)