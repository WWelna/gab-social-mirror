import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { loggedOut } from '../initial_state'
import { CX, MODAL_COMPOSE, BREAKPOINT_EXTRA_SMALL } from '../constants'
import { openModal } from '../actions/modal'
import Button from './button'
import { getGroupIdFromRoute } from '../utils/groups'

const btnClass = [
  _s.py15,
  _s.h60PX,
  _s.saveAreaInsetMR,
  _s.saveAreaInsetMB,
  _s.w60PX,
  _s.jcCenter,
  _s.aiCenter,
  _s.boxShadowBlock
].join(' ')

class FloatingActionButton extends React.PureComponent {
  get groupId() {
    return getGroupIdFromRoute(this)
  }

  get hasGroup() {
    return this.groupId !== undefined && this.groupId !== null
  }

  onClick = () => {
    const { groupId, hasGroup } = this
    const opts = hasGroup ? { groupId } : {}
    this.props.onOpenCompose(opts)
  }

  render() {
    const { intl, state, width } = this.props

    if (loggedOut) return null

    const isDesktop = width > BREAKPOINT_EXTRA_SMALL
    const message = intl.formatMessage(messages.gab)

    const containerClasses = CX({
      posFixed: 1,
      z3: 1,
      mb15: 1,
      mr15: 1,
      right0: 1,
      bottom55PX: !isDesktop,
      bottom0: isDesktop,
      pb15: isDesktop,
      pr15: isDesktop
    })

    return (
      <div className={containerClasses}>
        <Button
          onClick={this.onClick}
          className={btnClass}
          title={message}
          aria-label={message}
          icon="pencil"
          iconSize="20px"
        />
      </div>
    )
  }
}

const messages = defineMessages({
  gab: { id: 'gab', defaultMessage: 'Gab' }
})

const mapStateToProps = state => ({
  width: state.getIn(['settings', 'window_dimensions', 'width'])
})

const mapDispatchToProps = dispatch => ({
  onOpenCompose: opts => dispatch(openModal(MODAL_COMPOSE, opts))
})

FloatingActionButton.propTypes = {
  intl: PropTypes.object.isRequired,
  onOpenCompose: PropTypes.func.isRequired
}

export default withRouter(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(FloatingActionButton))
)
