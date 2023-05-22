import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { defineMessages, injectIntl } from 'react-intl'
import { getOrderedLists } from '../../selectors'
import { fetchLists } from '../../actions/lists'
import {
  LIST_TYPE_MEMBER_OF,
  LIST_TYPE_SUBSCRIBED_TO,
  LIST_TYPE_OWN,
  MODAL_LIST_CREATE,
} from '../../constants'
import PanelLayout from './panel_layout'
import List from '../list'
import TabBar from '../tab_bar'
import Button from '../button'
import Text from '../text'
import { openModal } from '../../actions/modal'

class ListsPanel extends ImmutablePureComponent {

  state = {
    fetched: false,
    activeList: LIST_TYPE_OWN,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.shouldLoad && !prevState.fetched) {
      return { fetched: true }
    }

    return null
  }

  componentDidMount() {
    if (!this.props.isLazy) {
      this.props.onFetchLists(this.state.activeList)
      this.setState({ fetched: true })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.fetched && this.state.fetched) {
      this.props.onFetchLists(this.state.activeList)
    }
  }
  
  handleOnChangeTab(tab) {
    this.setState({ activeList: tab })
    this.props.onFetchLists(tab)
  }

  handleOnOpenListCreateModal = () => {
    this.props.onOpenListCreateModal()
  }

  render() {
    const {
      intl,
      ownLists,
      memberOfLists,
      subscribedToLists,
      listsListsBlock,
     } = this.props
    const { fetched, activeList } = this.state

    const tabs = [
      {
        title: 'My Feeds',
        onClick: () => this.handleOnChangeTab(LIST_TYPE_OWN),
        active: activeList === LIST_TYPE_OWN,
      },
      {
        title: 'Subscribed to',
        onClick: () => this.handleOnChangeTab(LIST_TYPE_SUBSCRIBED_TO),
        active: activeList === LIST_TYPE_SUBSCRIBED_TO,
      },
      {
        title: 'Member of',
        onClick: () => this.handleOnChangeTab(LIST_TYPE_MEMBER_OF),
        active: activeList === LIST_TYPE_MEMBER_OF,
      }
    ]

    const maxCount = 8
    const isFetched = fetched || listsListsBlock.getIn([activeList, 'isFetched'], false)
    const isLoading = listsListsBlock.getIn([activeList, 'isLoading'], false)
    const lists = activeList === LIST_TYPE_OWN ? ownLists : activeList === LIST_TYPE_MEMBER_OF ? memberOfLists : subscribedToLists    
    
    const listItems = !!lists && lists.slice(0, maxCount).map((list) => ({
      to: `/feeds/${list.get('id')}`,
      title: list.get('title'),
      icon: list.get('visibility') === 'private' ? 'lock' : 'globe',
    }))

    const message = (
      <div>
        <div className={[_s.d, _s.maxH56PX, _s.flexRow, _s.bgPrimary, _s.z3, _s.borderBottom1PX, _s.borderColorSecondary, _s.w100PC].join(' ')}>
          <TabBar tabs={tabs} />
        </div>
        <div className={[_s.d, _s.boxShadowNone].join(' ')}>
          {((isLoading && !isFetched) || listItems.size > 0) &&
          <List
            scrollKey='lists_sidebar_panel'
            items={listItems}
            isLoading={isLoading}
            showLoading={(lists.size === 0 && !isFetched) || isLoading}
          />
          }
          {!isLoading && !listItems.size > 0 && activeList === LIST_TYPE_OWN &&
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
          }
          {!isLoading && !listItems.size > 0 && activeList === LIST_TYPE_SUBSCRIBED_TO &&
          <div className={[_s.d, _s.w100PC, _s.aiCenter, _s.py15, _s.px15, _s.jcCenter].join(' ')}>
            <Text>
              You haven't subscribed to any feeds yet.
            </Text>
            <Button
              className={[_s.d, _s.mt15].join(' ')}
              to='/feeds'
            >
              See Featured Feeds
            </Button>
          </div>
          }
          {!isLoading && !listItems.size > 0 && activeList === LIST_TYPE_MEMBER_OF &&
          <div className={[_s.d, _s.w100PC, _s.aiCenter, _s.py15, _s.px15, _s.jcCenter].join(' ')}>
            <Text>
              If you're added to any public feeds, they'll appear here.
            </Text>
          </div>
          }
        </div>
      </div>
    )

    return (
      <PanelLayout
        title='Your Feeds'
        noPadding
      >
        { message }

      </PanelLayout>
    )
  }

}

const messages = defineMessages({
  title: { id: 'lists.subheading', defaultMessage: 'Your Lists' },
  show_all: { id: 'groups.sidebar-panel.show_all', defaultMessage: 'Show all' },
})

const mapStateToProps = (state) => ({
  listsListsBlock: state.getIn(['lists_lists']),
  ownLists: getOrderedLists(state, LIST_TYPE_OWN),
  memberOfLists: getOrderedLists(state, LIST_TYPE_MEMBER_OF),
  subscribedToLists: getOrderedLists(state, LIST_TYPE_SUBSCRIBED_TO),
})

const mapDispatchToProps = (dispatch) => ({
  onFetchLists: (type) => dispatch(fetchLists(type)),
  onOpenListCreateModal: () => dispatch(openModal(MODAL_LIST_CREATE)),
})

ListsPanel.propTypes = {
  onFetchLists: PropTypes.func.isRequired,
  lists: ImmutablePropTypes.list,
  intl: PropTypes.object.isRequired,
  isLazy: PropTypes.bool,
  shouldLoad: PropTypes.bool,
  onOpenListCreateModal: PropTypes.func.isRequired,
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ListsPanel))
