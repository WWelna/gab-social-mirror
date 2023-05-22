import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import PopoverLayout from './popover_layout'
import List from '../list'
import Text from '../text'

function StatusModalConfirmPopover({ onDiscard, onKeep, onClose, isEdit }) {
  const items = [
    {
      hideArrow: true,
      title: 'Yes',
      onClick: onDiscard
    },
    {
      hideArrow: true,
      title: 'No, keep editing',
      onClick: onKeep
    }
  ]

  const title = isEdit ? 'Cancel editing?' : 'Discard message?'

  return (
    <PopoverLayout onClose={onClose}>
      <div className={_s.d}>
        <Text className={[_s.d, _s.px15, _s.py10, _s.bgSecondary].join(' ')}>
          {title}
        </Text>
        <List items={items} />
      </div>
    </PopoverLayout>
  )
}

const mapDispatchToProps = (dispatch, { onConfirmDiscard, onConfirmKeep }) => ({
  onClose: () => dispatch(closePopover()),
  onDiscard: () => {
    onConfirmDiscard()
    dispatch(closePopover())
  },
  onKeep: () => {
    onConfirmKeep()
    dispatch(closePopover())
  }
})

StatusModalConfirmPopover.propTypes = {
  onConfirmDiscard: PropTypes.func,
  onConfirmKeep: PropTypes.func,
  isEdit: PropTypes.bool
}

export default connect(null, mapDispatchToProps)(StatusModalConfirmPopover)
