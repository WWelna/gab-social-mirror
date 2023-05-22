import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { getGroupStatusContexts, getGlobalStatusContexts } from '../../selectors'
import PopoverLayout from './popover_layout'
import List from '../list'
import { CX } from '../../constants'

class ComposePostContextPopover extends ImmutablePureComponent {
  handleOnClick(statusContextId) {
    const { onClose, onStatusContextChange } = this.props
    onStatusContextChange && onStatusContextChange(statusContextId)
    onClose()
  }

  render() {
    const { isXS, onClose, selectedStatusContextId, statusContexts } = this.props

    const items = []

    if (selectedStatusContextId) {
      items.push({
        hideArrow: true,
        title: 'Remove context',
        onClick: () => this.handleOnClick(null)
      })
    }

    statusContexts.forEach((statusContext) => {
      items.push({
        hideArrow: true,
        title: statusContext.get('name'),
        onClick: () => this.handleOnClick(statusContext.get('id'))
      })
    })

    const listWrapperStyles = CX({
      d: 1,
      maxH340PX: !isXS,
      overflowYScroll: !isXS
    })

    return (
      <PopoverLayout width={320} isXS={isXS} onClose={onClose}>
        <div className={listWrapperStyles}>
          <List size={isXS ? 'large' : 'normal'} items={items} />
        </div>
      </PopoverLayout>
    )
  }
}

const mapStateToProps = (state, { groupId }) => {
  const statusContexts = !!groupId ? getGroupStatusContexts(state, { groupId, isEnabled: true }) : getGlobalStatusContexts(state, { isEnabled: true })
  return {
    statusContexts,
  }
}

ComposePostContextPopover.propTypes = {
  isXS: PropTypes.bool,
  onClose: PropTypes.func,
  onStatusContextChange: PropTypes.func,
  selectedStatusContextId: PropTypes.string,
  groupId: PropTypes.string,
  statusContexts: ImmutablePropTypes.list,
}

export default connect(mapStateToProps)(ComposePostContextPopover)
