import React from 'react'
import { withRouter } from 'react-router-dom'
import ComposeForm from './components/compose_form'
import { getGroupIdFromRoute } from '../../utils/groups'

class Compose extends React.PureComponent {
  get groupId() {
    return getGroupIdFromRoute(this)
  }

  render() {
    return (
      <ComposeForm
        composerId="compose-page"
        formLocation="standalone"
        autoFocus
        groupId={this.groupId}
      />
    )
  }
}

export default withRouter(Compose)
