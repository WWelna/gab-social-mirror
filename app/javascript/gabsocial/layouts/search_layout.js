import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { me } from '../initial_state'
import {
  BREAKPOINT_EXTRA_SMALL,
  CX,
} from '../constants'
import { fetchTrendingHashtags } from '../actions/trending_hashtags'
import Layout from '../layouts/layout'
import PageTitle from '../features/ui/util/page_title'
import DefaultNavigationBar from '../components/navigation_bar/default_navigation_bar'
import FooterBar from '../components/footer_bar'
import SearchNavigationBar from '../components/navigation_bar/search_navigation_bar_xs'
import LoggedOutNavigationBar from '../components/navigation_bar/logged_out_navigation_bar'
import Responsive from '../features/ui/util/responsive_component'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import Search from '../components/search'
import Pills from '../components/pills'
import {
  LinkFooter,
  TrendsBreakingPanel,
  SearchFilterPanel,
  SignUpPanel,
  ExploreTimeline,
  HashtagTimeline,
  SidebarXS,
  GabAdPanel,
} from '../features/ui/util/async_components'

class SearchLayout extends React.PureComponent {

  state = {
    isSearchFocused: false,
    currentExploreTabIndex: 0,
    setTrendingHashtags: false,
    exploreTabs: [
      {
        title: 'Explore',
        onClick: () => this.setState({ currentExploreTabIndex: 0 }),
        component: ExploreTimeline,
      }
    ]
  }

  componentDidMount() {
    const { intl } = this.props

    this.searchTabs = [
      {
        title: intl.formatMessage(messages.top),
        to: '/search',
        active: 1,
      },
      {
        title: intl.formatMessage(messages.people),
        to: '/search/people',
      },
      {
        title: intl.formatMessage(messages.groups),
        to: '/search/groups',
      },
      {
        title: intl.formatMessage(messages.statuses),
        to: '/search/statuses',
      },
      {
        title: intl.formatMessage(messages.hashtags),
        to: '/search/hashtags',
      },
      /*
      {
        title: intl.formatMessage(messages.links),
        to: '/search/links',
      },
      */
    ]
    
    this._shouldSetTrendingHashtags()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.trendingHashtags !== this.props.trendingHashtags) {
      this._shouldSetTrendingHashtags()
    }
  }

  _shouldSetTrendingHashtags = () => {
    const {
      isXS,
      trendingHashtags,
      trendingHashtagsFetched,
    } = this.props
    const { exploreTabs, setTrendingHashtags } = this.state

    if (!isXS || setTrendingHashtags) return false
    
    if (!trendingHashtagsFetched) {
      this.props.onFetchTrendingHashtags()
      return
    }

    if (Array.isArray(trendingHashtags) && trendingHashtagsFetched) {
      trendingHashtags.forEach((block, i) => {
        let j = i + 1
        exploreTabs.push({
          title: `#${block.tag}`,
          onClick: () => this.setState({ currentExploreTabIndex: j }),
          component: HashtagTimeline,
          componentParams: { params: { id: `${block.tag}`.toLowerCase() } },
        })
      })
      this.setState({
        exploreTabs,
        setTrendingHashtags: true,
      })  
    }
  }

  handleOnToggleSearchExplore = (isSearchFocused) => {
    this.setState({ isSearchFocused })
  }

  render() {
    const {
      intl,
      children,
      value,
    } = this.props
    const {
      exploreTabs,
      isSearchFocused,
      currentExploreTabIndex,
     } = this.state

    const activeExploreTab = exploreTabs[currentExploreTabIndex];
    const activeTabComponent = activeExploreTab.component
    const activeTabComponentParams = activeExploreTab.componentParams || {}
    const activeExploreTabs = exploreTabs.map((tab, i) => {
      return {
        ...tab,
        active: i === currentExploreTabIndex,
      }
    })

    const title = intl.formatMessage(messages.search)
    const qos = !!value ? value : ''

    return (
      <React.Fragment>
        <Responsive max={BREAKPOINT_EXTRA_SMALL}>

          <WrappedBundle component={SidebarXS} />

          {
            !!me &&
            <SearchNavigationBar
              isSearchFocused={isSearchFocused}
              tabs={isSearchFocused ? this.searchTabs : activeExploreTabs}
              onToggleSearchExplore={this.handleOnToggleSearchExplore}
            />
          }
          {
            !me &&
            <LoggedOutNavigationBar />
          }

          <main role='main' className={[_s.d, _s.w100PC, _s.z1].join(' ')}>

            {
              !me &&
              <div className={[_s.d, _s.py15].join(' ')}>
                <Pills pills={this.searchTabs} />
              </div>
            }

            {
              !!isSearchFocused &&
              children
            }

            {
              !isSearchFocused &&
              <div className={[_s.d, _s.pt10, _s.w100PC].join(' ')}>
                <WrappedBundle
                  component={activeTabComponent}
                  componentParams={activeTabComponentParams}
                />
              </div>
            }
          </main>

          <FooterBar />

        </Responsive>

        <Responsive min={BREAKPOINT_EXTRA_SMALL}>
          <Layout
            noComposeButton
            title={title}
            showBackBtn
            tabs={this.searchTabs}
            page={`search.${qos}`}
            layout={[
              SignUpPanel,
              SearchFilterPanel,
              GabAdPanel,
              TrendsBreakingPanel,
              LinkFooter,
            ]}
          >
            <PageTitle path={title} />
            {children}
          </Layout>
        </Responsive>

      </React.Fragment>
    )
  }

}


const messages = defineMessages({
  search: { id: 'search', defaultMessage: 'Search' },
  top: { id: 'top', defaultMessage: 'Top' },
  people: { id: 'people', defaultMessage: 'People' },
  groups: { id: 'groups', defaultMessage: 'Groups' },
  statuses: { id: 'statuses', defaultMessage: 'Statuses' },
  hashtags: { id: 'hashtags', defaultMessage: 'Hashtags' },
  links: { id: 'links', defaultMessage: 'Links' },
})

const mapStateToProps = (state) => ({
  value: state.getIn(['search', 'value']),
  trendingHashtags: state.getIn(['trending_hashtags', 'items']),
  trendingHashtagsFetched: state.getIn(['trending_hashtags', 'fetched'], false),
  isXS: state.getIn(['settings', 'window_dimensions', 'width']) <= BREAKPOINT_EXTRA_SMALL,
})

const mapDispatchToProps = (dispatch) => ({
  onFetchTrendingHashtags() {
    dispatch(fetchTrendingHashtags())
  },
})


SearchLayout.propTypes = {
  intl: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  value: PropTypes.string,
  trendingHashtags: PropTypes.array,
  isXS: PropTypes.bool.isRequired,
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SearchLayout))
