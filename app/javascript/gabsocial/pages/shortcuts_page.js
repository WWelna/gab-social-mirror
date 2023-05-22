import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { openModal } from '../actions/modal'
import { MODAL_EDIT_SHORTCUTS } from '../constants'
import PageTitle from '../features/ui/util/page_title'
import DefaultLayout from '../layouts/default_layout'
import {
  LinkFooter,
  TrendsBreakingPanel,
  UserSuggestionsPanel,
} from '../features/ui/util/async_components'

class ShortcutsPage extends React.PureComponent {

  handleOnOpenEditShortcutsModal = () => {
    this.props.dispatch(openModal(MODAL_EDIT_SHORTCUTS))
  }

  render() {
    const { intl, children, showSuggestedUsers } = this.props

    const title = intl.formatMessage(messages.shortcuts)

    let sidebarLayout = [TrendsBreakingPanel]

    if(showSuggestedUsers) {
      sidebarLayout.push(UserSuggestionsPanel)
    }

    sidebarLayout.push(LinkFooter)

    return (
      <DefaultLayout
        showBackBtn
        title={title}
        page='shortcuts'
        actions={[
          {
            icon: 'cog',
            onClick: this.handleOnOpenEditShortcutsModal,
          },
        ]}
        layout={sidebarLayout}
      >
        <PageTitle path={title} />
        {children}
      </DefaultLayout>
    )
  }
}

const messages = defineMessages({
  shortcuts: { id: 'shortcuts', defaultMessage: 'Shortcuts' },
})

ShortcutsPage.propTypes = {
  children: PropTypes.node.isRequired,
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
}

export default injectIntl(connect()(ShortcutsPage))