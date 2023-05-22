import React from 'react'
import { BREAKPOINT_EXTRA_SMALL, CX, searchTabs } from '../constants'
import Layout from '../layouts/layout'
import PageTitle from '../features/ui/util/page_title'
import FooterBar from '../components/footer_bar'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import { loggedIn } from '../initial_state'
import {
  LinkFooter,
  TrendsBreakingPanel,
  SearchFilterPanel,
  SignUpPanel,
  SidebarXS
} from '../features/ui/util/async_components'
import Icon from '../components/icon'
import Text from '../components/text'
import Block from '../components/block'
import Search from '../components/search'
import Pills from '../components/pills'
import { parseQuerystring } from '../utils/querystring'

const loggedOutMessage = (
  <div className={CX('mt10')}>
    <Block>
      <Text className={CX('px10', 'py10')}>
        <Icon id='warning' /> Search is available for users that are logged in.
      </Text>
    </Block>
    <br/>
    <WrappedBundle component={SignUpPanel} />
  </div>
)

export default function SearchLayout({ children }) {
  const { q } = parseQuerystring({ q: '' })
  let pageTitle = 'Search'
  const { pathname } = window.location
  const tabs = searchTabs.map(({ title, to }, index) => ({
    title,
    to: `${to}?q=${q}`,
    active: to === pathname
  }))
  const selectedTab = tabs.find(item => item.active)
  if (selectedTab) {
    pageTitle = `${pageTitle} ${selectedTab.title}`
  }
  const inner = loggedIn ? children : loggedOutMessage

  if (window.innerWidth <= BREAKPOINT_EXTRA_SMALL) {
    return (
      <>
        <WrappedBundle component={SidebarXS} />
        <div className={CX('bgPrimary', 'borderColorSecondary', 'px5', 'mb5')}>
          <Search isInNav />
        </div>
        <Pills pills={tabs} />
        {inner}
        <FooterBar />
      </>
    )
  }

  return (
    <Layout
      noComposeButton
      title={pageTitle}
      tabs={tabs}
      page={`search.${q}`}
      layout={[
        SignUpPanel,
        SearchFilterPanel,
        TrendsBreakingPanel,
        LinkFooter
      ]}
    >
      <PageTitle path={pageTitle} />
      {inner}
    </Layout>
  )
}
