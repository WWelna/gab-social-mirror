import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { defineMessages, injectIntl } from 'react-intl'
import { getOrderedLists } from '../../selectors'
import { fetchLists } from '../../actions/lists'
import PanelLayout from './panel_layout'
import List from '../list'
import TabBar from '../tab_bar'

class ListsPanel extends ImmutablePureComponent {

  state = {
    fetched: false,
    activeList: 'own',
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.shouldLoad && !prevState.fetched) {
      return { fetched: true }
    }

    return null
  }

  componentDidMount() {
    if (!this.props.isLazy) {
      this.props.onFetchLists()
      this.setState({ fetched: true })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.fetched && this.state.fetched) {
      this.props.onFetchLists()
    }
  }
  
  handleOnChangeTab(tab) {
    this.setState({ activeList: tab })
  }

  render() {
    const {
      intl,
      ownLists,
      memberOfLists,
      subscribedToLists,
      isFetched,
     } = this.props
    const { fetched, activeList } = this.state

    const ownListsSize = !!ownLists ? ownLists.count() : 0
    const memberOfListsSize = !!memberOfLists ? memberOfLists.count() : 0
    const subscribedToListsSize = !!subscribedToLists ? subscribedToLists.count() : 0
    const tabs = []
    const maxCount = 6

    if (ownListsSize === 0 && memberOfListsSize === 0 && subscribedToListsSize === 0 && isFetched) {
      return null
    }

    if (ownListsSize > 0) { 
      tabs.push( {
        title: 'My Feeds',
        onClick: () => this.handleOnChangeTab('own'),
        active: activeList === 'own',
      })
    }
    if (subscribedToListsSize > 0) {
      tabs.push({
        title: 'Subscribed to',
        onClick: () => this.handleOnChangeTab('subscribed_to'),
        active: activeList === 'subscribed_to',
      })
    }
    if (memberOfListsSize > 0) {
      tabs.push({
        title: 'Member of',
        onClick: () => this.handleOnChangeTab('member_of'),
        active: activeList === 'member_of',
      })
    }

    const lists = activeList === 'own' ? ownLists : activeList === 'member_of' ? memberOfLists : subscribedToLists
    
    const listItems = !!lists && lists.slice(0, maxCount).map((list) => ({
      to: `/feeds/${list.get('id')}`,
      title: list.get('title'),
      icon: list.get('visibility') === 'private' ? 'lock' : 'globe',
    }))

    const showShowMore = ownListsSize > 6 || memberOfListsSize > 0 || subscribedToListsSize > 0

    return (
      <PanelLayout
        title='Your Feeds'
        headerButtonTitle={intl.formatMessage(messages.show_all)}
        headerButtonTo='/feeds'
        footerButtonTitle={showShowMore ? intl.formatMessage(messages.show_all) : undefined}
        footerButtonTo={showShowMore ? '/feeds' : undefined}
        noPadding
      >
        <div className={[_s.d, _s.maxH56PX, _s.flexRow, _s.bgPrimary, _s.z3, _s.borderBottom1PX, _s.borderColorSecondary, _s.w100PC].join(' ')}>
          <TabBar tabs={tabs} />
        </div>
        <div className={[_s.d, _s.boxShadowNone].join(' ')}>
          <List
            scrollKey='lists_sidebar_panel'
            items={listItems}
            showLoading={!fetched}
          />
        </div>
      </PanelLayout>
    )
  }

}

const messages = defineMessages({
  title: { id: 'lists.subheading', defaultMessage: 'Your Lists' },
  show_all: { id: 'groups.sidebar-panel.show_all', defaultMessage: 'Show all' },
})

const mapStateToProps = (state) => ({
  ownLists: getOrderedLists(state, 'own'),
  memberOfLists: getOrderedLists(state, 'member_of'),
  subscribedToLists: getOrderedLists(state, 'subscribed_to'),
  isFetched: state.getIn(['lists', 'isFetched']),
})

const mapDispatchToProps = (dispatch) => ({
  onFetchLists: () => dispatch(fetchLists()),
})

ListsPanel.propTypes = {
  onFetchLists: PropTypes.func.isRequired,
  lists: ImmutablePropTypes.list,
  intl: PropTypes.object.isRequired,
  isLazy: PropTypes.bool,
  shouldLoad: PropTypes.bool,
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ListsPanel))