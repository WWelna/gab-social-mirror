import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import queryString from 'query-string'
import { openModal } from '../actions/modal'
import PageTitle from '../features/ui/util/page_title'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import DefaultLayout from '../layouts/default_layout'
import {
  LIST_TYPE_FEATURED,
  LIST_TYPE_OWN,
  LIST_TYPE_MEMBER_OF,
  LIST_TYPE_SUBSCRIBED_TO,
  MODAL_LIST_CREATE,
} from '../constants'
import { me } from '../initial_state'
import {
  LinkFooter,
  GabTVVideosPanel,
  UserSuggestionsPanel,
  GabAdTopPanel,
  GabAdBottomPanel,
} from '../features/ui/util/async_components'
import { parseQuerystring } from '../utils/querystring'

class ListsPage extends React.PureComponent {

  state = {
    currentTab: LIST_TYPE_FEATURED,
  }

  componentDidMount() {
    this.checkCurrentTab()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.key !== this.props.location.key &&
        prevProps.location.pathname === '/feeds' &&
        this.props.location.pathname === '/feeds'
      ) {
      this.checkCurrentTab()
    }
  }

  checkCurrentTab = () => {
    // null/no tab is "featured" aka main landing page of /feeds
    const { tab } = parseQuerystring({ tab: '' })
    this.setState({ currentTab: tab })
  }

  onOpenListCreateModal = () => {
    this.props.dispatch(openModal(MODAL_LIST_CREATE))
  }

  render() {
    const { children, showVideos, showSuggestedUsers } = this.props
    const { currentTab } = this.state

    const tabs = !!me ? [
      {
        title: 'My Feeds',
        to: `/feeds?tab=${LIST_TYPE_OWN}`,
        active: currentTab === LIST_TYPE_OWN,
      },
      {
        title: 'Member of',
        to: `/feeds?tab=${LIST_TYPE_MEMBER_OF}`,
        active: currentTab === LIST_TYPE_MEMBER_OF,
      },
      {
        title: 'Subscribed to',
        to: `/feeds?tab=${LIST_TYPE_SUBSCRIBED_TO}`,
        active: currentTab === LIST_TYPE_SUBSCRIBED_TO,
      },
      {
        title: 'Featured Feeds',
        to: '/feeds',
        active: !currentTab || currentTab === LIST_TYPE_FEATURED,
      },
    ] : [{
      title: 'Featured Feeds',
      to: '/feeds',
    }]

    let sidebarLayout = [
      <WrappedBundle key='feed-page-ad-panel' component={GabAdTopPanel} componentParams={{ pageKey: 'feed.sidebar', position: 1 }} />,
    ]
    
    if(showVideos) {
      sidebarLayout.push(GabTVVideosPanel)
    }
    
    if(showSuggestedUsers) {
      sidebarLayout.push(UserSuggestionsPanel)
    }

    sidebarLayout.push(LinkFooter)
    sidebarLayout.push(<WrappedBundle key='home-page-ad-panel-bottom' component={GabAdBottomPanel} componentParams={{ pageKey: 'home.sidebar.bottom', position: 2 }} />)

    return (
      <DefaultLayout
        showBackBtn
        title='Feeds'
        page='lists'
        actions={[
          {
            icon: 'add',
            onClick: this.onOpenListCreateModal,
          },
        ]}
        tabs={tabs}
        layout={sidebarLayout}
      >
        <PageTitle path='Feeds' />
        {children}
      </DefaultLayout>
    )
  }

}

ListsPage.propTypes = {
  children: PropTypes.node.isRequired,
  dispatch: PropTypes.func.isRequired,
}

export default withRouter(connect()(ListsPage))
