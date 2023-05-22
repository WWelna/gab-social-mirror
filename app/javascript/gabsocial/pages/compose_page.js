import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import PageTitle from '../features/ui/util/page_title'
import { fetchGroup } from '../actions/groups'
import ComposeLayout from '../layouts/compose_layout'
import { BREAKPOINT_EXTRA_SMALL } from '../constants'
import { getGroupIdFromRoute } from '../utils/groups'
import { parseQuerystring } from '../utils/querystring'
import { dispatchWindowEvent } from '../utils/events'

class ComposePage extends React.PureComponent {
  get groupId() {
    return getGroupIdFromRoute(this)
  }

  get hasGroup() {
    return this.groupId !== undefined && this.groupId !== null
  }

  get groupLoaded() {
    const { groupId } = this
    const { groups } = this.props
    return groupId && groups.get(groupId)
  }

  componentDidMount() {
    if (!this.groupLoaded) {
      this.props.loadGroup(this.groupId)
    }

    const { url, text } = parseQuerystring({ url: '', text: '' })
    if (url.length > 0 || text.length > 0) {
      let value = ''
      if (text.length > 0) value += text
      if (text.endsWith('\n') === false) {
        value += ' '
      }
      if (url.length > 0) value += url
      value = value.trim()
      dispatchWindowEvent('composer-insert', {
        composerId: 'compose-page',
        text: value
      })
    }
  }

  render() {
    const { hasGroup, groupId } = this
    const { children, width, location } = this.props
    const hasQueryParameters =
      location.search !== '' && location.search.includes('then=') === false
    const isXS = width <= BREAKPOINT_EXTRA_SMALL
    const isExternal = hasQueryParameters && !hasGroup
    return (
      <ComposeLayout title="Compose" isXS={isXS} isExternal={isExternal}>
        <PageTitle path="Compose" />
        {children}
      </ComposeLayout>
    )
  }
}

const mapStateToProps = state => ({
  width: state.getIn(['settings', 'window_dimensions', 'width']),
  groups: state.get('groups')
})

const mapDispatchToProps = dispatch => ({
  loadGroup: groupId => dispatch(fetchGroup(groupId))
})

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ComposePage)
)
