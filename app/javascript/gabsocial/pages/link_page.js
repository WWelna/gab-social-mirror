import React from 'react'
import PropTypes from 'prop-types'
import PageTitle from '../features/ui/util/page_title'
import DefaultLayout from '../layouts/default_layout'
import {
  LinkFooter,
  TrendsBreakingPanel,
  UserSuggestionsPanel,
} from '../features/ui/util/async_components'

class LinkPage extends React.PureComponent {

  render() {
    const {
      children,
      page,
      title,
      showSuggestedUsers,
    } = this.props

    let sidebarLayout = [TrendsBreakingPanel]

    if(showSuggestedUsers) {
      sidebarLayout.push(UserSuggestionsPanel)
    }

    sidebarLayout.push(LinkFooter)

    return (
      <DefaultLayout
        noComposeButton
        showBackBtn
        title={title}
        page={page}
        layout={sidebarLayout}
      >
        <PageTitle path={title} />
        {children}
      </DefaultLayout>
    )
  }

}

LinkPage.propTypes = {
  children: PropTypes.node.isRequired,
  page: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}

export default LinkPage