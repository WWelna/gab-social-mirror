import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  BREAKPOINT_EXTRA_SMALL,
  SEARCH_TAB_ACCOUNT,
  SEARCH_TAB_STATUS,
  SEARCH_TAB_GROUP,
  SEARCH_TAB_LINK,
  SEARCH_TAB_LIST,
  SEARCH_TAB_HASHTAG,
} from '../constants'
import {
  submitSearch,
  setSearchTab,
  clearSearch,
  toggleFocused,
} from '../actions/search'
import Layout from '../layouts/layout'
import PageTitle from '../features/ui/util/page_title'
import FooterBar from '../components/footer_bar'
import SearchNavigationBar from '../components/navigation_bar/search_navigation_bar_xs'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import { me } from '../initial_state'
import {
  LinkFooter,
  TrendsBreakingPanel,
  SearchFilterPanel,
  SignUpPanel,
  ExploreTimeline,
  SidebarXS,
} from '../features/ui/util/async_components'

class SearchLayout extends React.Component {
  
  componentDidMount() {
    const tab = this.getTabByPathname(this.props.location.pathname)
    this.props.onSetSearchTab(tab)
  }

  getTabByPathname = (pathname) => {
    let tab = ''
    switch (pathname) {
    case '/search/people':
      tab = SEARCH_TAB_ACCOUNT
      break;
    case '/search/groups':
      tab = SEARCH_TAB_GROUP
      break;
    case '/search/statuses':
      tab = SEARCH_TAB_STATUS
      break;
    case '/search/links':
      tab = SEARCH_TAB_LINK
      break;
    case '/search/feeds':
      tab = SEARCH_TAB_LIST
      break;
    case '/search/hashtags':
      tab = SEARCH_TAB_HASHTAG
      break;
    default:
      break;
    }
    return tab
  }

  handleOnSetSearchTab = (tab) => {
    const {
      value,
      onSubmitSearch,
      onSetSearchTab,
      resultsBlock,
      submitted,
    } = this.props
    
    onSetSearchTab(tab)

    if (value) {
      // : todo :
      // dont submit every tab change if already has submitted results with existing value
      // const resultsByTab = resultsBlock.get(tab)
      // console.log("resultsBlock, resultsByTab:", resultsBlock)
      // if (!resultsByTab.get('isFetched') && !submitted) {
        onSubmitSearch()
      // }
    }
  }

  render() {
    const {
      children,
      value,
      focused,
      isXS,
    } = this.props
    const qs = value.length > 0 ? `?q=${escape(value)}` : ''
    const title = 'Search'
    const qos = !!value ? value : ''
    const { pathname } = window.location
    const exploring = pathname === '/search' && value.length === 0 && !focused && isXS
    const searching = value.length > 0

    const searchTabs = [
      !!me && {
        title: 'Explore',
        to: '/search',
        isHidden: !isXS,
        active: exploring,
      },
      {
        title: 'People',
        to: isXS ? '/search/people' : '/search',
        onClick: () => this.handleOnSetSearchTab(SEARCH_TAB_ACCOUNT),
      },
      {
        title: 'Groups',
        to: '/search/groups',
        onClick: () => this.handleOnSetSearchTab(SEARCH_TAB_GROUP),
      },
      !!me && {
        title: 'Statuses',
        to: '/search/statuses',
        onClick: () => this.handleOnSetSearchTab(SEARCH_TAB_STATUS),
      },
      !!me && {
        title: 'Links',
        to: '/search/links',
        onClick: () => this.handleOnSetSearchTab(SEARCH_TAB_LINK),
      },
      !!me && {
        title: 'Feeds',
        to: '/search/feeds',
        onClick: () => this.handleOnSetSearchTab(SEARCH_TAB_LIST),
      },
      { // go to page with marketplace listing search with query. then it automatically searches
        title: 'Marketplace',
        to: `/marketplace/listings${value.length > 0 ? `?query=${this.props.value}` : ''}`,
      },
      !!me && {
        title: 'Hashtags',
        to: '/search/hashtags',
        onClick: () => this.handleOnSetSearchTab(SEARCH_TAB_HASHTAG),
      }
    ].filter(Boolean).map((item, index) => {
      if (['Explore', 'Marketplace'].indexOf(item.title) > -1) {
        return item
      }
      item.active = !exploring && pathname === item.to
      item.to += qs
      return item
    })

    if (isXS) {
      return (
        <React.Fragment>
          <WrappedBundle component={SidebarXS} />
          <SearchNavigationBar
            isSearchFocused={focused}
            tabs={searchTabs}
            cancel={this.props.cancel}
          />
          <main role='main' className={[_s.d, _s.w100PC, _s.z1].join(' ')}>
            {(searching || !me) && children}
            {
              (exploring && !!me) &&
              <div className={[_s.d, _s.pt10, _s.w100PC].join(' ')}>
                <WrappedBundle component={ExploreTimeline} />
              </div>
            }
          </main>
          <FooterBar />
        </React.Fragment>
      )
    }

    return (
      <Layout
        noComposeButton
        title={title}
        showBackBtn
        tabs={searchTabs}
        page={`search.${qos}`}
        layout={[
          SignUpPanel,
          SearchFilterPanel,
          TrendsBreakingPanel,
          LinkFooter,
        ]}
      >
        <PageTitle path={title} />
        {children}
      </Layout>
    )
  }

}

const mapStateToProps = (state) => ({
  value: state.getIn(['search', 'value']),
  submitted: state.getIn(['search', 'submitted']),
  focused: state.getIn(['search', 'focused']),
  resultsBlock: state.getIn(['search', 'results']),
  isXS: state.getIn(['settings', 'window_dimensions', 'width']) <= BREAKPOINT_EXTRA_SMALL,
})

const mapDispatchToProps = (dispatch) => ({
  onSetSearchTab(tab) {
    dispatch(setSearchTab(tab))
  },
  onSubmitSearch() {
    dispatch(submitSearch())
  },
  cancel() {
    dispatch(clearSearch())
    dispatch(toggleFocused(false))
  }
})

SearchLayout.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string,
  isXS: PropTypes.bool.isRequired,
  focused: PropTypes.bool.isRequired
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchLayout))
