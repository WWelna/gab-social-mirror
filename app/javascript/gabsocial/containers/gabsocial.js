'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import { connect, Provider } from 'react-redux'
import configureStore from '../store/configureStore'
import { BrowserRouter, Route } from 'react-router-dom'
import moment from 'moment-mini'
import { ScrollContext } from 'react-router-scroll-4'
import { IntlProvider, addLocaleData } from 'react-intl'
import { fetchCustomEmojis } from '../actions/custom_emojis'
import { fetchPromotions } from '../actions/promotions'
import { fetchChatConversationUnreadCount } from '../actions/chat_conversations'
import { routerChange } from '../actions/router'
import { hydrateStore } from '../actions/store'
import { MIN_ACCOUNT_CREATED_AT_ONBOARDING } from '../constants'
import {
  connectUserStream,
  connectStatusUpdateStream,
  connectChatMessagesStream,
} from '../actions/streaming'
import { saveWindowDimensions } from '../actions/settings'
import { getLocale } from '../locales'
import initialState from '../initial_state'
import { me, isFirstSession } from '../initial_state'
import UI from '../features/ui'
import IntroductionPage from '../pages/introduction_page'
import ErrorBoundary from '../components/error_boundary'
import Display from './display'
import { fetchBlocks, fetchBlockedby } from '../actions/blocks'
import { fetchMutes } from '../actions/mutes'

const { localeData, messages } = getLocale()
addLocaleData(localeData)

export const store = configureStore()
const hydrateAction = hydrateStore(initialState)

store.dispatch(hydrateAction)
store.dispatch(fetchCustomEmojis())
store.dispatch(fetchPromotions())
store.dispatch(fetchChatConversationUnreadCount())
store.dispatch(saveWindowDimensions())

const mapStateToProps = (state) => ({
  accountCreatedAt: !!me ? state.getIn(['accounts', me, 'created_at']) : undefined,
  shownOnboarding: state.getIn(['settings', 'shownOnboarding']),
})

@connect(mapStateToProps)
class GabSocialMount extends React.PureComponent {

  static propTypes = {
    shownOnboarding: PropTypes.bool.isRequired,
    accountCreatedAt: PropTypes.string,
  }

  state = {
    shownOnboarding: this.props.shownOnboarding,
    shouldShow: false,
  }

  componentDidMount() {
    if (!!me && this.props.accountCreatedAt) {
      //If first time opening app, and is new user, show onboarding
      const accountCreatedAtValue = moment(this.props.accountCreatedAt).valueOf()
      const shouldShow = isFirstSession && !this.state.shownOnboarding && accountCreatedAtValue > MIN_ACCOUNT_CREATED_AT_ONBOARDING

      if (shouldShow) this.setState({ shouldShow })
    }

    if (!!me) {
      const metricsUpdated = Date.parse(localStorage.getItem('metrics_updated')) || null
      if (!metricsUpdated || Date.now().valueOf() > metricsUpdated + 60) {
        localStorage.setItem('metrics_updated', Date.now().valueOf())
        store.dispatch(fetchBlocks())
        store.dispatch(fetchBlockedby())
        store.dispatch(fetchMutes())
      }
    }

    this.handleResize()
    window.addEventListener('resize', this.handleResize, false)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize, false)
  }

  handleResize = () => {
    this.props.dispatch(saveWindowDimensions())
  }

  routerRef = r => {
    if (r && r.history && r.history.listen) {
      r.history.listen(details => store.dispatch(routerChange(details)))
    }
  }

  render () {
    const { shownOnboarding, shouldShow } = this.state
    
    if (!shownOnboarding && shouldShow) {
      return (
        <BrowserRouter>
          <Route path='/' component={IntroductionPage} />
        </BrowserRouter>
      )
    }

    return (
      <BrowserRouter ref={this.routerRef}>
        <ScrollContext>
          <Route path='/' component={UI} />
        </ScrollContext>
      </BrowserRouter>
    )
  }

}

export default class GabSocial extends React.PureComponent {

  static propTypes = {
    locale: PropTypes.string.isRequired,
  }

  componentDidMount() {
    if (!!me) {
      this.disconnect = store.dispatch(connectUserStream())
      store.dispatch(connectStatusUpdateStream())
      store.dispatch(connectChatMessagesStream(me))
    }

    console.log('%cGab Social ', [
      , 'color: #30CE7D'
      , 'display: block'
      , 'line-height: 80px'
      , 'font-family: system-ui, -apple-system, BlinkMacSystemFont, Roboto, Ubuntu, "Helvetica Neue", sans-serif'
      , 'font-size: 36px'
      , 'text-align: left'
      , 'font-weight: 800'
    ].join(';'))
    console.log('%cThis is a browser feature intended for developers.\nIf someone told you to copy and paste something here it is a scam and will give them access to your Gab account. ', [
      , 'color: #000'
      , 'display: block'
      , 'line-height: 30px'
      , 'font-family: system-ui, -apple-system, BlinkMacSystemFont, Roboto, Ubuntu, "Helvetica Neue", sans-serif'
      , 'font-size: 20px'
      , 'text-align: left'
      , 'font-weight: 600'
    ].join(';'))
  }

  componentWillUnmount () {
    if (this.disconnect) {
      this.disconnect()
      this.disconnect = null
    }
  }

  render () {
    const { locale } = this.props

    return (
      <IntlProvider locale={locale} messages={messages}>
        <Provider store={store}>
          <Display>
            <ErrorBoundary>
              <GabSocialMount />
            </ErrorBoundary>
          </Display>
        </Provider>
      </IntlProvider>
    )
  }

}
