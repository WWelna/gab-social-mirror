'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import { connect, Provider } from 'react-redux'
import store from '../store'
import { BrowserRouter, Route } from 'react-router-dom'
import { IntlProvider, addLocaleData } from 'react-intl'
import { fetchCustomEmojis } from '../actions/custom_emojis'
import { fetchChatConversationUnreadCount } from '../actions/chat_conversations'
import { routerChange } from '../actions/router'
import { hydrateStore } from '../actions/store'
import { connectAltStream } from '../actions/streaming'
import { saveWindowDimensions } from '../actions/settings'
import { hydrateActiveReactions } from '../actions/reactions'
import { hydrateGlobalStatusContexts } from '../actions/status_contexts'
import { getLocale } from '../locales'
import initialState from '../initial_state'
import { me } from '../initial_state'
import UI from '../features/ui'
import IntroductionPage from '../pages/introduction_page'
import ErrorBoundary from '../components/error_boundary'
import Display from './display'
import { fetchBlocksAndMutes } from '../actions/blocks'
import { fetchFilters } from '../actions/filters'

const { localeData, messages } = getLocale()
addLocaleData(localeData)

export { store }
const hydrateAction = hydrateStore(initialState)

store.dispatch(hydrateAction)
store.dispatch(fetchCustomEmojis())
store.dispatch(fetchChatConversationUnreadCount())
store.dispatch(saveWindowDimensions())
store.dispatch(hydrateActiveReactions())
if (me) store.dispatch(hydrateGlobalStatusContexts())

class GabSocialMount extends React.PureComponent {
  componentDidMount() {
    // this runs before other things or else they can prevent us bubbling up
    window.addEventListener('popstate', details => store.dispatch(routerChange({ popstate: true, ...details })))

    if (!!me) {
      const metricsUpdated = Date.parse(localStorage.getItem('metrics_updated')) || null
      if (!metricsUpdated || Date.now().valueOf() > metricsUpdated + 60) {
        localStorage.setItem('metrics_updated', Date.now().valueOf())
        store.dispatch(fetchBlocksAndMutes())
      }
      store.dispatch(fetchFilters())
    }

    this.handleResize()
    window.addEventListener('resize', this.handleResize, false)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize, false)
  }

  handleResize = () => {
    store.dispatch(saveWindowDimensions())
  }

  routerRef = r => {
    if (r && r.history && r.history.listen) {
      r.history.listen(details => store.dispatch(routerChange(details)))
    }
  }

  render () {
    return (
      <BrowserRouter ref={this.routerRef}>
        <Route path='/' component={UI} />
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
      store.dispatch(connectAltStream(store.dispatch))
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
