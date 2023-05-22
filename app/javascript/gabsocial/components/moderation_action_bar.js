import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import StatusActionBarItem from './status_action_bar_item'
import { CX, MODAL_CONFIRM } from '../constants'
import { openModal } from '../actions/modal'
import {
  respondModerationRequest,
  groupModerationRespondOptions
} from '../actions/groups'
import Divider from './divider'

class ModerationActionBar extends ImmutablePureComponent {

  render() {
    const { statusId, groupId } = this.props
    return (<>
      <div className={CX({ d: 1, flexRow: 1 })}>
        {groupModerationRespondOptions.map((item) =>
          <StatusActionBarItem
            key={item.action}
            title={item.title}
            icon={item.icon}
            onClick={() => this.props.onModAction(item)}
          />
        )}
      </div>
      <Divider isSmall />
    </>)
  }
  
}

function mapDispatchToProps(dispatch, { timelineId, statusId }) {
  const groupId = timelineId.split(':').pop()
  const responder = action =>
    respondModerationRequest({ statusId, groupId, action })
  return {
    onModAction({ action, message, title: confirm }) {
      dispatch(openModal(MODAL_CONFIRM, {
        message,
        confirm,
        onConfirm: () => dispatch(responder(action))
      }))
    },
  }
}

ModerationActionBar.propTypes = {
  onModAction: PropTypes.func.isRequired,
  statusId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  timelineId: PropTypes.string,
}

export default connect(null, mapDispatchToProps)(ModerationActionBar)
