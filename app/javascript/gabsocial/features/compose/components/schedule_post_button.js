import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, defineMessages } from 'react-intl'
import { openModal } from '../../../actions/modal'
import { closePopover, openPopover } from '../../../actions/popover'
import { isPro } from '../../../initial_state'
import ComposeExtraButton from './compose_extra_button'
import { POPOVER_DATE_PICKER, MODAL_PRO_UPGRADE } from '../../../constants'

class SchedulePostButton extends React.PureComponent {
  setButton = ref => (this.button = ref)

  handleToggle = () => {
    if (!isPro) {
      this.props.onOpenProUpgradeModal()
    } else {
      this.props.onOpenDatePickerPopover(this.button)
    }
  }

  render() {
    const { intl, small, scheduled_at, composerId, popoverType, popoverProps } =
      this.props
    const popoverOpen =
      popoverType === POPOVER_DATE_PICKER &&
      popoverProps &&
      popoverProps.composerId === composerId

    return (
      <ComposeExtraButton
        active={popoverOpen || scheduled_at !== null}
        buttonRef={this.setButton}
        icon="calendar"
        onClick={this.handleToggle}
        small={small}
        title={intl.formatMessage(messages.schedule_status)}
        iconClassName={_s.cIconComposeSchedule}
      />
    )
  }
}

const messages = defineMessages({
  schedule_status: { id: 'schedule_status.title', defaultMessage: 'Schedule' }
})

const mapStateToProps = state => ({
  popoverType: state.getIn(['popover', 'popoverType']),
  popoverProps: state.getIn(['popover', 'popoverProps'])
})

const mapDispatchToProps = (
  dispatch,
  { onSchedule, scheduled_at, composerId }
) => ({
  onOpenDatePickerPopover(targetRef) {
    dispatch(
      openPopover(POPOVER_DATE_PICKER, {
        targetRef,
        onSchedule,
        scheduled_at,
        composerId
      })
    )
  },
  onCloseDatePickerPopover() {
    dispatch(closePopover())
  },
  onOpenProUpgradeModal() {
    dispatch(openModal(MODAL_PRO_UPGRADE))
  }
})

SchedulePostButton.propTypes = {
  intl: PropTypes.object.isRequired,
  onOpenProUpgradeModal: PropTypes.func.isRequired,
  onOpenDatePickerPopover: PropTypes.func.isRequired,
  onCloseDatePickerPopover: PropTypes.func.isRequired,
  onSchedule: PropTypes.func.isRequired,
  small: PropTypes.bool,
  disabled: PropTypes.bool,
  scheduled_at: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
    PropTypes.number
  ]),
  composerId: PropTypes.string
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(SchedulePostButton)
)
