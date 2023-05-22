'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
// import { HotKeys } from 'react-hotkeys'
import { defineMessages, injectIntl } from 'react-intl'
import { Switch, Redirect, withRouter } from 'react-router-dom'
import debounce from 'lodash/debounce'
import queryString from 'query-string'
import moment from 'moment-mini'
import { MIN_ACCOUNT_CREATED_AT_ONBOARDING } from '../../constants'
import { fetchUnreadWarningsCount } from '../../actions/warnings'
import LoadingBar from '../../components/loading_bar'
import { clearHeight } from '../../actions/height_cache'
import { openModal } from '../../actions/modal'
import { fetchGroupsByTab } from '../../actions/groups'
import { fetchGabTVExplore } from '../../actions/news'
import { fetchGroupCategories } from '../../actions/group_categories'
import { fetchFeaturedProducts } from '../../actions/shop'
import {
  fetchRelatedSuggestions,
  fetchPopularSuggestions,
} from '../../actions/suggestions'
import { fetchPublicRooms } from '../../store/voice_public_rooms'
import WrappedRoute from './util/wrapped_route'
import ModalRoot from '../../components/modal/modal_root'
import ToastsContainer from '../../containers/toasts_container'
import PopoverRoot from '../../components/popover/popover_root'
import ProfilePage from '../../pages/profile_page'
import HashtagPage from '../../pages/hashtag_page'
import ShortcutsPage from '../../pages/shortcuts_page'
import GroupPage from '../../pages/group_page'
import GroupsPage from '../../pages/groups_page'
import SearchPage from '../../pages/search_page'
import ErrorPage from '../../pages/error_page'
import HomePage from '../../pages/home_page'
import NotificationsPage from '../../pages/notifications_page'
import ListPage from '../../pages/list_page'
import ListsPage from '../../pages/lists_page'
import BasicPage from '../../pages/basic_page'
import ModalPage from '../../pages/modal_page'
import SettingsPage from '../../pages/settings_page'
import ProPage from '../../pages/pro_page'
import ExplorePage from '../../pages/explore_page'
import NewsPage from '../../pages/news_page'
import AboutPage from '../../pages/about_page'
import LinkPage from '../../pages/link_page'
import MessagesPage from '../../pages/messages_page'
import ComposePage from '../../pages/compose_page'
import DeckPage from '../../pages/deck_page'
import IntroductionPage from '../../pages/introduction_page'
import MarketplaceListingCategoriesPage from '../../pages/marketplace_listing_categories_page'
import MarketplaceListingsPage from '../../pages/marketplace_listings_page'
import EmptyPage from '../../pages/empty_page'


import {
  About,
  AccountMarketplaceListings,
  AccountPhotoGallery,
  AccountVideoGallery,
  AccountTimeline,
  AccountCommentsTimeline,
  Assets,
  BlockedAccounts,
  BookmarkCollections,
  BookmarkCollectionCreate,
  BookmarkedStatuses,
  CaliforniaConsumerProtection,
  CaliforniaConsumerProtectionContact,
  ChatConversationCreate,
  ChatConversationRequests,
  ChatConversationBlockedAccounts,
  ChatConversationMutes,
  Compose,
  Deck,
  DMCA,
  ExploreTimeline,
  // Filters,
  Followers,
  Following,
  FollowRequests,
  GenericNotFound,
  GroupsCollection,
  GroupCollectionTimeline,
  GroupCreate,
  GroupAbout,
  GroupJoinRequests,
  GroupModerationTimeline,
  GroupMembers,
  GroupRemovedAccounts,
  GroupTimeline,
  GroupsCategories,
  GroupCategory,
  GroupTag,
  HashtagTimeline,
  HomeTimeline,
  Investors,
  LikedStatuses,
  LinkTimeline,
  ListCreate,
  ListsDirectory,
  ListEdit,
  ListTimeline,
  MarketplaceListingCategories,
  MarketplaceListingCreate,
  MarketplaceListingDetail,
  MarketplaceListingSaves,
  MarketplaceListingsDashboard,
  MarketplaceListingsFrontPage,
  MarketplaceListings,
  Messages,
  MutedAccounts,
  News,
  NewsView,
  Notifications,
  PollsTimeline,
  Press,
  PrivacyPolicy,
  ProTimeline,
  ProPhotosTimeline,
  ProVideosTimeline,
  Search,
  Shortcuts,
  StatusContextTimeline,
  StatusFeature,
  StatusLikes,
  StatusReposts,
  StatusQuotes,
  Suggestions,
  TermsOfSale,
  TermsOfService,
  Warnings,
  Introduction,
} from './util/async_components'
import { me, meUsername, isFirstSession, showVideos, showSuggestedUsers, showGroups } from '../../initial_state'
import { parseQuerystring } from '../../utils/querystring'

// Dummy import, to make sure that <Status /> ends up in the application bundle.
// Without this it ends up in ~8 very commonly used bundles.
import '../../components/status'

const messages = defineMessages({
  beforeUnload: { id: 'ui.beforeunload', defaultMessage: 'Your draft will be lost if you leave Gab Social.' },
  publish: { id: 'compose_form.publish', defaultMessage: 'Gab' },
})

const mapStateToProps = (state) => ({
  accountCreatedAt: !!me ? state.getIn(['accounts', me, 'created_at']) : undefined,
  shownOnboarding: state.getIn(['settings', 'shownOnboarding']),
})

/* const keyMap = {
  help: '?',
  new: 'n',
  search: 's',
  forceNew: 'option+n',
  reply: 'r',
  Favorite: 'f',
  boost: 'b',
  mention: 'm',
  open: ['enter', 'o'],
  openProfile: 'p',
  moveDown: ['down', 'j'],
  moveUp: ['up', 'k'],
  back: 'backspace',
  goToHome: 'g h',
  goToNotifications: 'g n',
  goToStart: 'g s',
  goToFavorites: 'g f',
  goToProfile: 'g u',
  goToBlocked: 'g b',
  goToMuted: 'g m',
  goToRequests: 'g r',
} */

class SwitchingArea extends React.PureComponent {

  componentDidMount() {
    window.addEventListener('resize', this.handleResize, {
      passive: true,
    })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  handleResize = debounce(() => {
    // The cached heights are no longer accurate, invalidate
    this.props.onLayoutChange()
  }, 500, {
    trailing: true,
  })

  setRef = c => {
    this.node = c.getWrappedInstance()
  }

  render() {
    const { children } = this.props

    return (
      <Switch>
        {
          !!me &&
          <Redirect from='/' to='/home' exact />
        }
        {
          !me &&
          <WrappedRoute path='/' exact publicRoute page={ExplorePage} component={ExploreTimeline} content={children} componentParams={{ title: 'Gab.com' }} />
        }

        <WrappedRoute path='/home' exact page={HomePage} component={HomeTimeline} content={children} componentParams={{ showVideos, showSuggestedUsers, showGroups }} />

        <WrappedRoute path='/deck' exact page={DeckPage} component={Deck} content={children} />

        <WrappedRoute path='/about' publicRoute exact page={AboutPage} component={About} content={children} componentParams={{ title: 'About' }} />
        <WrappedRoute path='/about/assets' publicRoute exact page={AboutPage} component={Assets} content={children} componentParams={{ title: 'Assets' }} />
        <WrappedRoute path='/about/dmca' publicRoute exact page={AboutPage} component={DMCA} content={children} componentParams={{ title: 'DMCA' }} />
        <WrappedRoute path='/about/investors' publicRoute exact page={AboutPage} component={Investors} content={children} componentParams={{ title: 'Investors' }} />
        <WrappedRoute path='/about/press' publicRoute exact page={AboutPage} component={Press} content={children} componentParams={{ title: 'Press' }} />
        <WrappedRoute path='/about/privacy' publicRoute exact page={AboutPage} component={PrivacyPolicy} content={children} componentParams={{ title: 'Privacy Policy' }} />
        <WrappedRoute path='/about/sales' publicRoute exact page={AboutPage} component={TermsOfSale} content={children} componentParams={{ title: 'Terms of Sale' }} />
        <WrappedRoute path='/about/tos' publicRoute exact page={AboutPage} component={TermsOfService} content={children} componentParams={{ title: 'Terms of Service' }} />
        <WrappedRoute path='/about/ccpa' publicRoute exact page={AboutPage} component={CaliforniaConsumerProtection} content={children} componentParams={{ title: 'Terms of Service' }} />
        <WrappedRoute path='/about/ccpa/contact' publicRoute exact page={AboutPage} component={CaliforniaConsumerProtectionContact} content={children} componentParams={{ title: 'Terms of Service' }} />
        <WrappedRoute path='/about/introduction' page={IntroductionPage} component={Introduction} content={children} />

        <WrappedRoute path='/explore' publicRoute page={ExplorePage} component={ExploreTimeline} content={children} componentParams={{ title: 'Explore', showVideos, showSuggestedUsers, showGroups }} />
        <WrappedRoute path='/suggestions' exact page={BasicPage} component={Suggestions} content={children} componentParams={{ title: 'Suggestions', showSuggestedUsers }} />
        <WrappedRoute path='/compose' exact page={ComposePage} component={Compose} content={children} componentParams={{ title: 'Compose', page: 'compose' }} />

        <WrappedRoute path='/news' exact publicRoute page={NewsPage} component={News} content={children} componentParams={{ title: 'News' }} />
        <WrappedRoute path='/news/view/:trendsRSSId' page={NewsPage} component={NewsView} content={children} componentParams={{ title: 'News RSS Feed' }} />

        <WrappedRoute path='/messages' exact page={MessagesPage} component={Messages} content={children} componentParams={{ source: 'approved' }} />
        <WrappedRoute path='/messages/new' exact page={BasicPage} component={ChatConversationCreate} content={children} componentParams={{ title: 'New Message', showSuggestedUsers }} />
        {/*<WrappedRoute path='/messages/settings' exact page={MessagesPage} component={MessagesSettings} content={children} componentParams={{ isSettings: true }} />*/}
        <WrappedRoute path='/messages/requests' exact page={MessagesPage} component={ChatConversationRequests} content={children} componentParams={{ isSettings: true, source: 'requested' }} />
        <WrappedRoute path='/messages/blocks' exact page={MessagesPage} component={ChatConversationBlockedAccounts} content={children} componentParams={{ isSettings: true }} />
        <WrappedRoute path='/messages/muted_conversations' exact page={MessagesPage} component={ChatConversationMutes} content={children} componentParams={{ isSettings: true }} />
        <WrappedRoute path='/messages/:chatConversationId' exact page={MessagesPage} component={Messages} content={children} componentParams={{ source: 'approved' }} />

        <WrappedRoute path='/timeline/pro' publicRoute exact page={ProPage} component={ProTimeline} content={children} componentParams={{ title: 'Pro Feed', showVideos, showSuggestedUsers }} />
        <WrappedRoute path='/timeline/polls' publicRoute exact page={BasicPage} component={PollsTimeline} content={children} componentParams={{ title: 'Pro Polls Feed', showSuggestedUsers }} />
        <WrappedRoute path='/timeline/videos' publicRoute exact page={BasicPage} component={ProVideosTimeline} content={children} componentParams={{ title: 'Pro Videos Feed', showSuggestedUsers }} />
        <WrappedRoute path='/timeline/photos' publicRoute exact page={BasicPage} component={ProPhotosTimeline} content={children} componentParams={{ title: 'Pro Photos Feed', showSuggestedUsers }} />

        <WrappedRoute path='/timeline/context/:statusContextId' exact page={BasicPage} component={StatusContextTimeline} content={children} componentParams={{ title: 'Status Context Feed', showSuggestedUsers }} />

        <WrappedRoute path='/groups' publicRoute exact page={GroupsPage} component={GroupCollectionTimeline} content={children} componentParams={{ activeTab: 'timeline', collectionType: 'member' }} />
        { /* <WrappedRoute path='/groups/browse/new' exact page={GroupsPage} component={GroupsCollection} content={children} componentParams={{ activeTab: 'new' }} /> */ }
        <WrappedRoute path='/groups/browse/featured' exact page={GroupsPage} component={GroupsCollection} content={children} componentParams={{ activeTab: 'featured' }} />
        <WrappedRoute path='/groups/browse/member' exact page={GroupsPage} component={GroupsCollection} content={children} componentParams={{ activeTab: 'member' }} />
        <WrappedRoute path='/groups/browse/admin' exact page={GroupsPage} component={GroupsCollection} content={children} componentParams={{ activeTab: 'admin' }} />
        <WrappedRoute path='/groups/browse/categories' exact page={GroupsPage} component={GroupsCategories} content={children} componentParams={{ activeTab: 'categories' }} />
        <WrappedRoute path='/groups/browse/categories/:sluggedCategory' exact page={GroupsPage} component={GroupCategory} content={children} componentParams={{ activeTab: 'categories' }} />
        <WrappedRoute path='/groups/browse/tags/:sluggedTag' exact page={GroupsPage} component={GroupTag} content={children} />

        <WrappedRoute path='/groups/create' page={ModalPage} component={GroupCreate} content={children} componentParams={{ title: 'Create Group', page: 'create-group', showSuggestedUsers }} />
        <WrappedRoute path='/groups/:id/members' page={GroupPage} component={GroupMembers} content={children} />
        <WrappedRoute path='/groups/:id/requests' page={GroupPage} component={GroupJoinRequests} content={children} />
        <WrappedRoute path='/groups/:id/moderation' page={GroupPage} component={GroupModerationTimeline} content={children} />
        <WrappedRoute path='/groups/:id/removed-accounts' page={GroupPage} component={GroupRemovedAccounts} content={children} />
        <WrappedRoute path='/groups/:id/edit' page={ModalPage} component={GroupCreate} content={children} componentParams={{ title: 'Edit Group', page: 'edit-group', showSuggestedUsers }} />
        <WrappedRoute path='/groups/:id/about' publicRoute page={GroupPage} component={GroupAbout} content={children} />
        <WrappedRoute path='/groups/:id/compose' page={ComposePage} component={Compose} content={children} componentParams={{ title: 'Compose', page: 'compose' }} />
        { /* <WrappedRoute path='/groups/:id/media' publicRoute page={GroupPage} component={GroupTimeline} content={children} componentParams={{ isTimeline: true, onlyMedia: true }} /> */ }
        <WrappedRoute path='/groups/:id' exact publicRoute page={GroupPage} component={GroupTimeline} content={children} componentParams={{ isTimeline: true }} />

        <WrappedRoute path='/tags/:id' publicRoute page={HashtagPage} component={HashtagTimeline} content={children} componentParams={{ title: 'Hashtag', showSuggestedUsers }} />

        <WrappedRoute path='/links/:id' page={LinkPage} component={LinkTimeline} content={children} componentParams={{ title: 'Link Feed' }} />

        <WrappedRoute path='/shortcuts' page={ShortcutsPage} component={Shortcuts} content={children} componentParams={{ showSuggestedUsers }} />

        <WrappedRoute path='/warnings' page={BasicPage} component={Warnings} content={children} componentParams={{ title: 'Warnings', showSuggestedUsers }} />

        <WrappedRoute path='/feeds' publicRoute exact page={ListsPage} component={ListsDirectory} content={children} componentParams={{ showVideos, showSuggestedUsers }} />
        <WrappedRoute path='/feeds/create' exact page={ModalPage} component={ListCreate} content={children} componentParams={{ title: 'Create Feed', page: 'create-feed', showSuggestedUsers }} />
        <WrappedRoute path='/feeds/:id/edit' exact page={ModalPage} component={ListEdit} content={children} componentParams={{ title: 'Edit Feed', page: 'edit-feed', showSuggestedUsers }} />
        <WrappedRoute path='/feeds/:id' publicRoute page={ListPage} component={ListTimeline} content={children} componentParams={{ showVideos }} />

        <WrappedRoute path='/notifications' exact page={NotificationsPage} component={Notifications} content={children} componentParams={{ showVideos, showSuggestedUsers }} />
        <Redirect from='/follow_requests' to='/notifications/follow_requests' exact />
        <WrappedRoute path='/notifications/follow_requests' exact page={NotificationsPage} component={FollowRequests} content={children} />

        <Redirect from='/search' to='/search/people' exact />
        <WrappedRoute path='/search/:tab' publicRoute page={SearchPage} component={Search} content={children} />

        <WrappedRoute path='/marketplace' exact publicRoute page={MarketplaceListingsPage} component={MarketplaceListingsFrontPage} content={children} componentParams={{ title: 'Marketplace', page: 'marketplace' }} />
        <WrappedRoute path='/marketplace/categories' exact publicRoute page={MarketplaceListingCategoriesPage} component={MarketplaceListingCategories} content={children} componentParams={{ title: 'Marketplace', page: 'marketplace-categories', showSuggestedUsers }} />
        <WrappedRoute path='/marketplace/listings' exact publicRoute page={MarketplaceListingsPage} component={MarketplaceListings} content={children} />
        <WrappedRoute path='/marketplace/create' exact page={EmptyPage} component={MarketplaceListingCreate} content={children} componentParams={{ title: 'New Listing', page: 'marketplace-listing-create' }} />
        <WrappedRoute path='/marketplace/dashboard' exact page={EmptyPage} component={MarketplaceListingsDashboard} content={children} componentParams={{ title: 'Your Listings' }} />
        <WrappedRoute path='/marketplace/saved' exact page={ModalPage} component={MarketplaceListingSaves} content={children} componentParams={{ title: 'Marketplace Saves' }} />
        <WrappedRoute path='/marketplace/item/:id/edit' page={EmptyPage} component={MarketplaceListingCreate} content={children} componentParams={{ title: 'Edit Marketplace Listing', page: 'marketplace-listing-edit' }} />
        <WrappedRoute path='/marketplace/item/:id' publicRoute page={EmptyPage} component={MarketplaceListingDetail} content={children} componentParams={{ title: 'Listing', page: 'marketplace-listing-detail' }} />

        <WrappedRoute path='/settings/blocks' exact page={SettingsPage} component={BlockedAccounts} content={children} componentParams={{ title: 'Blocked Users' }} />
        <WrappedRoute path='/settings/mutes' exact page={SettingsPage} component={MutedAccounts} content={children} componentParams={{ title: 'Muted Users' }} />

        <WrappedRoute path='/:username' publicRoute exact page={ProfilePage} component={AccountTimeline} content={children} />

        <WrappedRoute path='/:username/comments' page={ProfilePage} component={AccountCommentsTimeline} content={children} />

        <WrappedRoute path='/:username/followers' page={ProfilePage} component={Followers} content={children} />
        <WrappedRoute path='/:username/following' page={ProfilePage} component={Following} content={children} />
        {/* <WrappedRoute path='/:username/marketplace_listings' page={ProfilePage} component={AccountMarketplaceListings} content={children} /> */}

        <WrappedRoute path='/:username/listings' publicRoute exact page={ProfilePage} component={AccountMarketplaceListings} content={children} componentParams={{ noSidebar: true }} />
        <WrappedRoute path='/:username/photos' exact page={ProfilePage} component={AccountPhotoGallery} content={children} componentParams={{ noSidebar: true }} />
        { /* <WrappedRoute path='/:username/albums/:albumId' page={ProfilePage} component={AccountAlbumGallery} content={children} componentParams={{ noSidebar: true }} />  */ }
        <WrappedRoute path='/:username/videos' exact page={ProfilePage} component={AccountVideoGallery} content={children} componentParams={{ noSidebar: true }} />
        { /* <WrappedRoute path='/:username/albums' exact page={ProfilePage} component={AccountAlbums} content={children} componentParams={{ noSidebar: true }} /> */ }
        { /* <WrappedRoute path='/:username/albums/create' exact page={ModalPage} component={AlbumCreate} content={children} componentParams={{ title: 'Create Album', page: 'create-album' }} /> */ }
        { /* <WrappedRoute path='/:username/albums/:albumId/edit' page={ModalPage} component={AlbumCreate} content={children} componentParams={{ title: 'Edit Album', page: 'edit-album' }} />  */ }

        <WrappedRoute path='/:username/likes' page={ProfilePage} component={LikedStatuses} content={children} />
        <WrappedRoute path='/:username/bookmarks' exact page={ProfilePage} component={BookmarkCollections} content={children} />
        <WrappedRoute path='/:username/bookmarks/create' page={ModalPage} component={BookmarkCollectionCreate} content={children} componentParams={{ title: 'Create Bookmark Collection', page: 'create-bookmark-collection', showSuggestedUsers }} />
        {/* <WrappedRoute path='/:username/bookmarks/:bookmarkCollectionId/edit' exact page={ModalPage} component={BookmarkCollectionEdit} content={children} componentParams={{ title: 'Edit Bookmark Collection', page: 'edit-bookmark-collection' }} /> */}
        <WrappedRoute path='/:username/bookmarks/:bookmarkCollectionId' page={ProfilePage} component={BookmarkedStatuses} content={children} />

        <WrappedRoute path='/:username/posts/:statusId' publicRoute exact page={BasicPage} component={StatusFeature} content={children} componentParams={{ title: 'Status', setDocTitle: false, page: 'status', showSuggestedUsers }} />

        <WrappedRoute path='/:username/posts/:statusId/reposts' publicRoute page={ModalPage} component={StatusReposts} content={children} componentParams={{ title: 'Reposts', showSuggestedUsers }} />
        <WrappedRoute path='/:username/posts/:statusId/quotes' publicRoute page={ModalPage} component={StatusQuotes} content={children} componentParams={{ title: 'Quotes', showSuggestedUsers }} />
        <WrappedRoute path='/:username/posts/:statusId/likes' page={ModalPage} component={StatusLikes} content={children} componentParams={{ title: 'Likes', showSuggestedUsers }} />

        <WrappedRoute page={ErrorPage} component={GenericNotFound} content={children} />
      </Switch>
    )
  }

}

SwitchingArea.propTypes = {
  children: PropTypes.node,
  location: PropTypes.object,
  onLayoutChange: PropTypes.func.isRequired,
  showVideos: PropTypes.bool,
  showSuggestedUsers: PropTypes.bool,
  showGroups: PropTypes.bool,
}

class UI extends React.PureComponent {

  state = {
    fetchedHome: false
  }

  handleLayoutChange = () => {
    // The cached heights are no longer accurate, invalidate
    this.props.dispatch(clearHeight())
  }

  handleServiceWorkerPostMessage = ({ data }) => {
    if (data.type === 'navigate') {
      this.props.history.push(data.path)
    } else {
      console.warn('Unknown message type:', data.type)
    }
  }

  componentDidMount() {
    if (!me) return

    const { dispatch } = this.props

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerPostMessage)
    }

    if (typeof window.Notification !== 'undefined' && Notification.permission === 'default') {
      window.setTimeout(() => Notification.requestPermission(), 120 * 1000)
    }

    const pathname = this.props.location.pathname

    if (pathname === '/home') {
      this.props.dispatch(fetchUnreadWarningsCount())
    }

    const introductionPath = '/about/introduction'
    if (
      !!me &&
      this.props.accountCreatedAt &&
      pathname.startsWith(introductionPath) === false
    ) {
      //If first time opening app, and is new user, show onboarding
      const accountCreatedAtValue = moment(this.props.accountCreatedAt).valueOf()
      const onboard = isFirstSession &&
        !this.props.shownOnboarding &&
        accountCreatedAtValue > MIN_ACCOUNT_CREATED_AT_ONBOARDING
      if (onboard) {
        this.props.history.push(introductionPath)
      }
    }

    if (showGroups) {
      dispatch(fetchGroupsByTab('featured'))
      dispatch(fetchGroupsByTab('member'))
    }

    if (showVideos) {
      dispatch(fetchGabTVExplore())
    }

    if (showSuggestedUsers) {
      dispatch(fetchRelatedSuggestions())
      dispatch(fetchPopularSuggestions())
    }

    dispatch(fetchGroupCategories())
    dispatch(fetchFeaturedProducts())
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      const pathname = this.props.location.pathname

      if (pathname === '/home' && !this.state.fetchedHome) {
        this.setState({ fetchedHome: true })
        this.props.dispatch(fetchUnreadWarningsCount())
      }
    }
  }

  setRef = (c) => {
    this.node = c
  }

  handleHotkeyNew = (e) => {
    e.preventDefault()

    const element = this.node.querySelector('.compose-form__autosuggest-wrapper textarea')

    if (element) {
      element.focus()
    }
  }

  handleHotkeySearch = (e) => {
    e.preventDefault()

    const element = this.node.querySelector('.search__input')

    if (element) {
      element.focus()
    }
  }

  handleHotkeyForceNew = (e) => {
    this.handleHotkeyNew(e)
  }

  handleHotkeyBack = () => {
    if (window.history && window.history.length === 1) {
      this.props.history.push('/home') // homehack
    } else {
      this.props.history.goBack()
    }
  }

  setHotkeysRef = (c) => {
    this.hotkeys = c
  }

  handleHotkeyToggleHelp = () => {
    this.props.dispatch(openModal('HOTKEYS'))
  }

  handleHotkeyGoToHome = () => {
    this.props.history.push('/home')
  }

  handleHotkeyGoToNotifications = () => {
    this.props.history.push('/notifications')
  }

  handleHotkeyGoToStart = () => {
    this.props.history.push('/getting-started')
  }

  handleHotkeyGoToFavorites = () => {
    this.props.history.push(`/${meUsername}/favorites`)
  }

  handleHotkeyGoToProfile = () => {
    this.props.history.push(`/${meUsername}`)
  }

  handleHotkeyGoToBlocked = () => {
    this.props.history.push('/blocks')
  }

  handleHotkeyGoToMuted = () => {
    this.props.history.push('/mutes')
  }

  handleHotkeyGoToRequests = () => {
    this.props.history.push('/follow_requests')
  }

  handleOpenComposeModal = () => {
    this.props.dispatch(openModal('COMPOSE'))
  }

  render() {
    const { children, location, showVideos, showSuggestedUsers, showGroups } = this.props

    // : todo :
    // const handlers = me ? {
    //   help: this.handleHotkeyToggleHelp,
    //   new: this.handleHotkeyNew,
    //   search: this.handleHotkeySearch,
    //   forceNew: this.handleHotkeyForceNew,
    //   back: this.handleHotkeyBack,
    //   goToHome: this.handleHotkeyGoToHome,
    //   goToNotifications: this.handleHotkeyGoToNotifications,
    //   goToStart: this.handleHotkeyGoToStart,
    //   goToFavorites: this.handleHotkeyGoToFavorites,
    //   goToProfile: this.handleHotkeyGoToProfile,
    //   goToBlocked: this.handleHotkeyGoToBlocked,
    //   goToMuted: this.handleHotkeyGoToMuted,
    //   goToRequests: this.handleHotkeyGoToRequests,
    // } : {}

    return (
      <div ref={this.setRef} className={_s.gabsocial}>
        <LoadingBar
          maxProgress={100}
          progressIncrease={100}
          showFastActions
          className={[_s.h2PX, _s.posFixed, _s.z6, _s.top53PX, _s.bgBrandLight, _s.saveAreaInsetMT].join(' ')}
        />

        <SwitchingArea location={location} onLayoutChange={this.handleLayoutChange} showVideos={showVideos} showSuggestedUsers={showSuggestedUsers} showGroups={showGroups}>
          {children}
        </SwitchingArea>

        <ModalRoot />
        <PopoverRoot />

        <ToastsContainer />
      </div>
    )
  }

}

UI.propTypes = {
  dispatch: PropTypes.func.isRequired,
  children: PropTypes.node,
  isComposing: PropTypes.bool,
  location: PropTypes.object,
  intl: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  accountCreatedAt: PropTypes.string,
  shownOnboarding: PropTypes.bool,
  showVideos: PropTypes.bool,
  showSuggestedUsers: PropTypes.bool,
  showGroups: PropTypes.bool,
}

export default injectIntl(withRouter(connect(mapStateToProps)(UI)))
