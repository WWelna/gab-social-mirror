import React from 'react'
import PropTypes from 'prop-types'
import PageTitle from '../features/ui/util/page_title'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import DefaultLayout from '../layouts/default_layout'
import {
  LinkFooter,
  TrendsBreakingPanel,
  UserSuggestionsPanel,
  GabAdTopPanel,
  GabAdBottomPanel,
} from '../features/ui/util/async_components'

class BasicPage extends React.PureComponent {

  render() {
    const {
      children,
      page,
      title,
      showSuggestedUsers,
      setDocTitle
    } = this.props

    let sidebarLayout = [
      <WrappedBundle key='basic-page-ad-panel' component={GabAdTopPanel} componentParams={{ pageKey: 'basic.sidebar', position: 1 }} />,
      TrendsBreakingPanel,
    ]

    if(showSuggestedUsers) {
      sidebarLayout.push(UserSuggestionsPanel)
    }

    sidebarLayout.push(LinkFooter)
    sidebarLayout.push(<WrappedBundle key='home-page-ad-panel-bottom' component={GabAdBottomPanel} componentParams={{ pageKey: 'home.sidebar.bottom', position: 2 }} />)

    return (
      <DefaultLayout
        noComposeButton
        showBackBtn
        title={title}
        page={page}
        layout={sidebarLayout}
      >
        {setDocTitle !== false && <PageTitle path={title} />}
        {children}
      </DefaultLayout>
    )
  }

}

BasicPage.propTypes = {
  children: PropTypes.node.isRequired,
  page: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  setDocTitle: PropTypes.bool,
}

export default BasicPage
