import React from 'react'
import { BREAKPOINT_EXTRA_SMALL, CX, searchTabs } from '../constants'
import Layout from '../layouts/layout'
import PageTitle from '../features/ui/util/page_title'
import FooterBar from '../components/footer_bar'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import {
  LinkFooter,
  TrendsBreakingPanel,
  SearchFilterPanel,
  SignUpPanel,
  SidebarXS,
  GabAdTopPanel,
  GabAdBottomPanel,
} from '../features/ui/util/async_components'
import Icon from '../components/icon'
import Text from '../components/text'
import Block from '../components/block'
import Search from '../components/search'
import Pills from '../components/pills'
import { parseQuerystring } from '../utils/querystring'

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

  if (window.innerWidth <= BREAKPOINT_EXTRA_SMALL) {
    return (
      <>
        <WrappedBundle component={SidebarXS} />
        <div className={CX('bgPrimary', 'borderColorSecondary', 'px5', 'mb5')}>
          <Search isInNav />
        </div>
        <Pills pills={tabs} />
        {children}
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
        <WrappedBundle key='search-page-ad-panel' component={GabAdTopPanel} componentParams={{ pageKey: 'search.sidebar', position: 1 }} />,
        SearchFilterPanel,
        TrendsBreakingPanel,
        LinkFooter,
        <WrappedBundle key='home-page-ad-panel-bottom' component={GabAdBottomPanel} componentParams={{ pageKey: 'home.sidebar.bottom', position: 2 }} />,
      ]}
    >
      <PageTitle path={pageTitle} />
      {children}
    </Layout>
  )
}
