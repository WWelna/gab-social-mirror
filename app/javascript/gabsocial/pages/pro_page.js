import React from 'react'
import PropTypes from 'prop-types'
import { defineMessages, injectIntl } from 'react-intl'
import PageTitle from '../features/ui/util/page_title'
import DefaultLayout from '../layouts/default_layout'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import {
  LinkFooter,
  UserSuggestionsPanel,
  ProgressPanel,
  GabTVVideosPanel,
  GabAdTopPanel,
  GabAdBottomPanel,
} from '../features/ui/util/async_components'

class ProPage extends React.PureComponent {

  render() {
    const { intl, children, showVideos, showSuggestedUsers } = this.props

    const title = intl.formatMessage(messages.title)

    let sidebarLayout = [
      <WrappedBundle key='pro-page-ad-panel' component={GabAdTopPanel} componentParams={{ pageKey: 'pro.sidebar', position: 1 }} />,
      ProgressPanel,
    ]

    if(showVideos) {
      sidebarLayout.push(GabTVVideosPanel)
    }

    if(showSuggestedUsers) {
      sidebarLayout.push((<WrappedBundle key='pro-page-user-suggestions-panel' component={UserSuggestionsPanel} componentParams={{ suggestionType: 'verified' }} />))
    }

    sidebarLayout.push(LinkFooter)
    sidebarLayout.push(<WrappedBundle key='home-page-ad-panel-bottom' component={GabAdBottomPanel} componentParams={{ pageKey: 'home.sidebar.bottom', position: 2 }} />)

    return (
      <DefaultLayout
        showBackBtn
        title={title}
        page='pro'
        layout={sidebarLayout}
      >
        <PageTitle path={title} />
        {children}
      </DefaultLayout>
    )
  }

}

const messages = defineMessages({
  title: { 'id': 'column.pro', 'defaultMessage': 'Pro feed' },
})

ProPage.propTypes = {
  children: PropTypes.node.isRequired,
  intl: PropTypes.object.isRequired,
}

export default injectIntl(ProPage)
