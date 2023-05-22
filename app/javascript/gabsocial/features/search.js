import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { List as ImmutableList } from 'immutable'
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import { withRouter, NavLink } from 'react-router-dom'
import ReactSwipeableViews from 'react-swipeable-views'
import { primaryInput } from 'detect-it'
import { me } from '../initial_state'
import {
  setSearchTab,
  expandSearch,
  submitSearch,
  changeSearch
} from '../actions/search'
import {
  changeMarketplaceListingSearchQuery,
  fetchMarketplaceListingsBySearch,
  marketplaceSearchReset
} from '../actions/marketplace_listing_search'
import {
  SEARCH_TAB_ACCOUNT,
  SEARCH_TAB_STATUS,
  SEARCH_TAB_GROUP,
  SEARCH_TAB_LINK,
  SEARCH_TAB_FEED,
  SEARCH_TAB_HASHTAG,
  SEARCH_TAB_MARKETPLACE,
  searchTabs,
  CX
} from '../constants'
import ResponsiveClassesComponent from '../features/ui/util/responsive_classes_component'
import AccountPlaceholder from '../components/placeholder/account_placeholder'
import StatusPlaceholder from '../components/placeholder/status_placeholder'
import GroupListItemPlaceholder from '../components/placeholder/group_list_item_placeholder'
import ListItemPlaceholder from '../components/placeholder/list_item_placeholder'
import TrendsItemPlaceholder from '../components/placeholder/trends_item_placeholder'
import MarketplaceListingCardPlaceholder from '../components/placeholder/marketplace_listing_card_placeholder'
import GroupListItem from '../components/group_list_item'
import Text from '../components/text'
import Account from '../components/account'
import ColumnIndicator from '../components/column_indicator'
import StatusContainer from '../containers/status_container'
import Block from '../components/block'
import Icon from '../components/icon'
import PreviewCardItem from '../components/preview_card_item'
import List from '../components/list'
import ListListItem from '../components/list_list_item'
import MarketplaceListingListItem from '../components/marketplace/marketplace_listing_list_item'
import ScrollableList from '../components/scrollable_list'
import Dummy from '../components/dummy'
import { parseQuerystring } from '../utils/querystring'

const InfoBox = ({ children }) => (
  <div className={CX('mt15', 'statusContent')}>
    <Block>
      <Text className={CX('px10', 'py10')}>
        {children}
      </Text>
    </Block>
  </div>
)

const helpDetectWords = [
  "help",
  "support",
  "fosco",
  "bug",
  "report",
  "admin",
  "developer"
]

// This is put into a <Block> when detecting help searches.
const helpBox = (
  <InfoBox>
    <Text>
      Looking for the <NavLink to="/groups/325">Help Group & Info</NavLink>?&nbsp;
      The support team can be reached at <a href="mailto:support@gab.com">support@gab.com</a>.
    </Text>
  </InfoBox>
)

const adsDetectWords = ["ads", "advertising", "torba", "ceo"]

// This is put into a <Block> when detecting ad searches.
const adBox = (
  <InfoBox>
    <Text>
      Post an ad with <a href="https://grow.gab.com/">grow.gab.com</a>.&nbsp;
      Join the <NavLink to="/groups/55618">Gab Advertisers</NavLink> group.
    </Text>
  </InfoBox>
)

// every placeholder renders different, some have a background, some don't
// some are rows, others columns
const loadingPlaceholdersMap = {
  [SEARCH_TAB_ACCOUNT]: () => <InfoBox>
    <AccountPlaceholder key="p1" />
    <AccountPlaceholder key="p2" />
  </InfoBox>,
  [SEARCH_TAB_GROUP]: () => <InfoBox>
    <GroupListItemPlaceholder key="p1" />
    <GroupListItemPlaceholder key="p2" />
  </InfoBox>,
  [SEARCH_TAB_LINK]: () => <InfoBox><TrendsItemPlaceholder /></InfoBox>,
  [SEARCH_TAB_STATUS]: () => <div className={CX('mt15')}><StatusPlaceholder /></div>,
  [SEARCH_TAB_FEED]: () => <InfoBox>
    <ListItemPlaceholder key="p1" />
    <ListItemPlaceholder key="p2" />
  </InfoBox>,
  [SEARCH_TAB_MARKETPLACE]: () => <InfoBox>
    <div className={CX('d', 'flexRow', 'hAuto', 'pb5')}>
      <div style={{ width: '30%', marginRight: '0.6rem' }}><MarketplaceListingCardPlaceholder key="p1" /></div>
      <div style={{ width: '30%', marginRight: '0.6rem' }}><MarketplaceListingCardPlaceholder key="p2" /></div>
      <div style={{ width: '30%', }}><MarketplaceListingCardPlaceholder key="p3" /></div>
    </div>
  </InfoBox>,
  [SEARCH_TAB_HASHTAG]: () => <InfoBox>
    <ListItemPlaceholder key="p1" />
    <ListItemPlaceholder key="p2" />
  </InfoBox>,
}

class Search extends ImmutablePureComponent {
  state = { isSmallScreen: (window.innerWidth <= 895) }

  get searchTab() {
    const { pathname } = this.props.location
    const found = searchTabs.find(item => item.to === pathname)
    return found || searchTabs[0]
  }

  get q() {
    const { q } = parseQuerystring({ q: '' })
    return q    
  }

  componentDidMount() {
    this.updateTab()
    this.props.onChange(this.q)
    this.submit()
  }

  componentDidUpdate(prevProps) {
    const { pathname: prevPath, search: prevSearch } = prevProps.location
    const { pathname: curPath, search: curSearch } = this.props.location
    const pathChange = prevPath !== curPath
    const searchChange = prevSearch !== curSearch
    const tabChanged = this.updateTab()
    if (searchChange) {
      this.props.onChange(this.q)
    }
    if (tabChanged || searchChange) {
      this.submit()
    }
  }

  /**
   * We can do normal search(people, statuses) or marketplace which is from
   * another section and another set of actions.
   */
  submit = () => {
    const { tab } = this.searchTab
    if (tab === SEARCH_TAB_MARKETPLACE) {
      this.props.marketSearch(this.props.value)
    } else {
      this.props.normalSearch()
    }
    if (this.state.isSmallScreen) {
      setTimeout(() => this.scrollToPill(), 50)
    }
  }

  scrollToPill = () => {
    const uri = window.location.href.replace(window.location.origin, '')
    const selector = `a[href='${uri}']`
    Array.from(document.querySelectorAll(selector))
      .forEach(function(el) {
        const isActive = el.classList.contains('active')
        const ariaCurrent = el.getAttribute('aria-current')
        if (isActive && ariaCurrent === 'page') {
          el.scrollIntoView()
        }
      })
  }

  /**
   * Update the search tab if necessary and return true if it changed.
   * @returns {boolean}
   */
  updateTab = () => {
    const { tab } = this.searchTab
    const tabChanged = tab !== this.props.tab
    if (tabChanged) {
      this.props.onSetSearchTab(tab)
    }
    return tabChanged
  }

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandSearch(this.searchTab.tab))
  }, 300, { leading: true })

  swipeChangeIndex = index => {
    const tab = searchTabs[index]
    if (tab) {
      this.props.history.push(`${tab.to}?q=${this.q}`)
    }
  }

  renderAccount = () => {
    const items = this.props.results.getIn([SEARCH_TAB_ACCOUNT, 'items'])
    const listItems = items.map(accountId =>
      <Account compact withBio key={accountId} id={accountId} />
    )
    return <Block>{listItems}</Block>
  }

  renderGroups = () => {
    const items = this.props.results.getIn([SEARCH_TAB_GROUP, 'items'])
    const listItems = items.map((groupId, i) =>
      <GroupListItem
        withDescription
        withVisibility
        size='large'
        key={groupId}
        id={groupId}
        isLast={items.size - 1 === i}
      />
    )
    return (
        <>
        <Block>{listItems}</Block>
        <InfoBox>
          <Icon id='group' /> Didn't find the group you want?&nbsp;
          <NavLink to="/groups/browse/featured">Browse featured groups</NavLink>&nbsp;
          or check <NavLink to="/groups/browse/categories">the categories.</NavLink>&nbsp;
          If it doesn't exist yet maybe it's time to&nbsp;
          <NavLink to="/groups/create">create a group</NavLink>.
        </InfoBox>
      </>
    )
  }

  renderLinks = () => {
    const items = this.props.results.getIn([SEARCH_TAB_LINK, 'items'])
    return items.map(linkId =>
      <PreviewCardItem key={linkId} id={linkId} isBordered />
    )
  }

  renderStatuses = () => {
    const items = this.props.results.getIn([SEARCH_TAB_STATUS, 'items'])
    return items.map(statusId =>
      <StatusContainer
        key={`status-${statusId}`}
        id={statusId}
        contextType='search'
        commentsLimited
      />
    )
  }

  renderFeeds = () => {
    const items = this.props.results.getIn([SEARCH_TAB_FEED, 'items'])
    const listItems = items.map(listId =>
      <ListListItem key={listId} id={listId} />
    )
    return <Block>{listItems}</Block>
  }

  renderMarketplace = () => {
    const listItems = this.props.marketplaceItemIds.map(listId =>
      <MarketplaceListingListItem key={listId} id={listId} />
    )
    return (
        <>
        <Block>{listItems}</Block>
        <InfoBox>
          <Icon id='shop' /> <NavLink to="/marketplace">Marketplace advanced search</NavLink>
        </InfoBox>
      </>
    )
  }

  renderHashtags = () => {
    const items = this.props.results.getIn([SEARCH_TAB_HASHTAG, 'items'])
    const hashtagListItems = items.map(tag => ({
      title: `#${tag.get('name')}`,
      to: `/tags/${tag.get('name')}`,
    }))
    return <List items={hashtagListItems} />
  }

  renderBlankSearch = () => {
    return (
      <InfoBox>
        <Text>Type in the box above and submit to perform a search.</Text>
      </InfoBox>
    )
  }

  renderBlankResults = () => {
    return  (
      <InfoBox>
        <ColumnIndicator type='missing' message={'No search results.'} />
      </InfoBox>
    )
  }

  renderError = () => {
    return  (
      <InfoBox>
        <ColumnIndicator type='missing' message={'Error fetching search results.'} />
      </InfoBox>
    )
  }

  render() {
    const { results, marketplaceItemIds, value } = this.props
    const { isSmallScreen } = this.state
    const { tab } = this.searchTab
    const isMarketplace = tab === SEARCH_TAB_MARKETPLACE
    let isLoading
    let isError
    let resultsSize

    if (isMarketplace) {
      isLoading = this.props.marketplaceLoading
      isError = this.props.marketplaceError
      resultsSize = marketplaceItemIds.size
    } else {
      const tabBlock = results.get(tab)
      const items = tabBlock.get('items')
      resultsSize = items.size
      isLoading = this.props.isLoading
      isError = this.props.isError
    }

    const noResults = resultsSize === 0
    let loadingPlaceholder = typeof loadingPlaceholdersMap[tab] === 'function' ?
      loadingPlaceholdersMap[tab]() :
      <AccountPlaceholder />
    let Wrapper = Block
    let browseMore = null
    const valueLower = value.toLowerCase()
    const lookingForHelp = helpDetectWords.some(item => value.includes(item))
    const lookingForAdvertising = adsDetectWords.some(item => value === item)
    const help = lookingForHelp ? helpBox : null
    const ads = lookingForAdvertising ? adBox : null
    const tabIndex = searchTabs.indexOf(this.searchTab)

    let errorMessage

    if (isLoading) {
      errorMessage = loadingPlaceholder
    } else if (isError) {
      errorMessage = this.renderError()
    } else if (value === '') {
      errorMessage = this.renderBlankSearch()
    } else if (noResults) {
      errorMessage = this.renderBlankResults()
    }

    const endMessages = (
      <div>
        {help}
        {ads}
      </div>
    )

    // it needs to match the order of constants#searchTabs
    const slides = [
      this.renderAccount(),
      this.renderGroups(),
      this.renderLinks(),
      this.renderStatuses(),
      this.renderFeeds(),
      this.renderMarketplace(),
      this.renderHashtags(),
    ].map(function wrapSlide(slideInner, index) {
      return (
        <div key={`search-slide-${index}`}>
          {errorMessage}
          <div>{slideInner}</div>
          {tabIndex === index ? endMessages : null}
        </div>
      )
    })

    return (
      <div className={_s.px2}>
        <ReactSwipeableViews
          style={{ minHeight: '400px' }}
          index={tabIndex}
          onChangeIndex={this.swipeChangeIndex}
          animateTransitions={primaryInput === 'touch'}
        >
          {slides}
        </ReactSwipeableViews>
      </div>
    )
  }

}

const mapStateToProps = (state) => ({
  isError: state.getIn(['search', 'isError']),
  isLoading: state.getIn(['search', 'isLoading']),
  results: state.getIn(['search', 'results']),
  tab: state.getIn(['search', 'tab']),
  value: state.getIn(['search', 'value']),
  marketplaceItemIds: state.getIn(['marketplace_listing_search', 'items']),
  marketplaceLoading: state.getIn(['marketplace_listing_search', 'isLoading']),
  marketplaceError: state.getIn(['marketplace_listing_search', 'isError']),
})

const mapDispatchToProps = dispatch => ({
  onSetSearchTab: tab => dispatch(setSearchTab(tab)),
  onChange: value => dispatch(changeSearch(value)),
  normalSearch: type => dispatch(submitSearch(type)),
  marketSearch: value => {
    // reset so we don't conflict with if a user visits /marketplace
    dispatch(marketplaceSearchReset())
    dispatch(changeMarketplaceListingSearchQuery(value))
    dispatch(fetchMarketplaceListingsBySearch())
    dispatch(marketplaceSearchReset())
  }
})

Search.propTypes = {
  isError: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  location: PropTypes.object,
  results: ImmutablePropTypes.map.isRequired,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Search))
