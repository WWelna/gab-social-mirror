import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { Set as ImmutableSet } from 'immutable'
import { toggleStatusReport } from '../actions/reports'
import Switch from './switch'
import StatusContainer from '../containers/status_container'

class StatusCheckBox extends ImmutablePureComponent {

  render () {
    const { status, checked, onToggle, disabled } = this.props

    if (status.get('reblog')) return null

    return (
      <div className={[_s.d, _s.flexRow, _s.flexWrap, _s.borderBottom1PX, _s.borderColorSecondary, _s.aiStart, _s.mb5, _s.pr15, _s.pt5, _s.w100PC].join(' ')}>
        <div className={[_s.d, _s.pt5, _s.flexGrow1, _s.maxW100PC86PX].join(' ')}>
          <StatusContainer id={status.get('id')} isChild />
          <div className={[_s.d, _s.posAbs, _s.top0, _s.bottom0, _s.left0, _s.right0, _s.z2].join(' ')} />
        </div>

        <div className={[_s.d, _s.mlAuto].join(' ')}>
          <Switch checked={checked} onChange={onToggle} disabled={disabled} />
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state, { id }) => ({
  status: state.getIn(['statuses', id]),
  checked: state.getIn(['reports', 'new', 'status_ids'], ImmutableSet()).includes(id),
})

const mapDispatchToProps = (dispatch, { id }) => ({
  onToggle(checked) {
    dispatch(toggleStatusReport(id, checked))
  },
})

StatusCheckBox.propTypes = {
  status: ImmutablePropTypes.map.isRequired,
  checked: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusCheckBox)

