import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { me } from '../initial_state'
import {
  BREAKPOINT_EXTRA_SMALL,
  CX,
} from '../constants'
import { clearSearch, toggleFocused } from '../actions/search'
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

class SearchLayout extends React.Component {
  state = { currentExploreTabIndex: 0 }
  render() {
    const { intl, children, value, focused } = this.props
    const { currentExploreTabIndex } = this.state
    const qs = value.length > 0 ? `?q=${escape(value)}` : ''
    const title = intl.formatMessage(messages.search)
    const qos = !!value ? value : ''
    const loggedIn = typeof me === 'string' && me.length > 0
    const loggedOut = !loggedIn
    const { pathname } = window.location
    const exploring = pathname === '/search' && value.length === 0
    const searching = value.length > 0

    const searchTabs = [
      {
        title: 'Explore',
        to: '/search',
        active: exploring
      },
      {
        title: intl.formatMessage(messages.top),
        to: '/search'
      },
      {
        title: intl.formatMessage(messages.people),
        to: '/search/people'
      },
      {
        title: intl.formatMessage(messages.groups),
        to: '/search/groups'
      },
      {
        title: intl.formatMessage(messages.statuses),
        to: '/search/statuses'
      },
      {
        title: intl.formatMessage(messages.hashtags),
        to: '/search/hashtags'
      }
    ].map(function(item, index) {
      if (index === 0) {
        return item // ignore explore
      }
      item.active = !exploring && pathname === item.to
      item.to += qs
      return item
    })

    return (
      <React.Fragment>
        <Responsive max={BREAKPOINT_EXTRA_SMALL}>
          <WrappedBundle component={SidebarXS} />
          <SearchNavigationBar
            isSearchFocused={focused}
            tabs={searchTabs}
            cancel={this.props.cancel}
          />
          <main role='main' className={[_s.d, _s.w100PC, _s.z1].join(' ')}>
            {searching && children}
            {
              exploring &&
              <div className={[_s.d, _s.pt10, _s.w100PC].join(' ')}>
                <WrappedBundle
                  component={ExploreTimeline}
                  componentParams={{}}
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
            tabs={searchTabs}
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
  focused: state.getIn(['search', 'focused']),
  isXS: state.getIn(['settings', 'window_dimensions', 'width']) <= BREAKPOINT_EXTRA_SMALL,
})

const mapDispatchToProps = (dispatch) => ({
  cancel(){
    dispatch(clearSearch())
    dispatch(toggleFocused(false))
  }
})


SearchLayout.propTypes = {
  intl: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  value: PropTypes.string,
  isXS: PropTypes.bool.isRequired,
  focused: PropTypes.bool.isRequired
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SearchLayout))
