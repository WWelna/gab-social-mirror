import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { openModal } from '../actions/modal'
import PageTitle from '../features/ui/util/page_title'
import DefaultLayout from '../layouts/default_layout'
import { MODAL_LIST_CREATE } from '../constants'
import {
  LinkFooter,
  GabTVVideosPanel,
  UserSuggestionsPanel,
  GabAdPanel,
} from '../features/ui/util/async_components'

class ListsPage extends React.PureComponent {

  onOpenListCreateModal = () => {
    this.props.dispatch(openModal(MODAL_LIST_CREATE))
  }

  render() {
    const { children, intl } = this.props

    return (
      <DefaultLayout
        showBackBtn
        title='Feeds'
        page='lists'
        actions={[
          {
            icon: 'add',
            onClick: this.onOpenListCreateModal,
          },
        ]}
        layout={[
          GabAdPanel,
          GabTVVideosPanel,
          UserSuggestionsPanel,
          LinkFooter,
        ]}
      >
        <PageTitle path='Feeds' />
        {children}
      </DefaultLayout>
    )
  }

}

ListsPage.propTypes = {
  children: PropTypes.node.isRequired,
  dispatch: PropTypes.func.isRequired,
}

export default connect()(ListsPage)