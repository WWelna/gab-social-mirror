import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { getToasts } from '../selectors'
import { dismissToast } from '../actions/toasts'
import { CX } from '../constants'
import Toast from '../components/toast'

class ToastsContainer extends React.PureComponent {

  handleOnDismiss = (toastKey) => {
    this.props.dispatch(dismissToast(toastKey))
  }

  render() {
    const { notifications } = this.props

    const hasNotifications = !!notifications && notifications.size > 0
    
    const containerClasses = CX({
      d: 1,
      z5: 1,
      posFixed: 1,
      bottom55PX: 1,
      left0: 1,
      pl15: 1,
      pt15: 1,
      maxH100VH: 1,
      pb10: 1,
      saveAreaInsetMB: 1,
      displayNone: !hasNotifications
    })

    return (
      <div className={containerClasses}>
        {
          hasNotifications && notifications.map((notification) => (
            <Toast
              onDismiss={this.handleOnDismiss}
              id={notification.get('key')}
              key={`toast-${notification.get('key')}`}
              title={notification.get('title', '')}
              to={notification.get('to', null)}
              image={notification.get('image', null)}
              message={notification.get('message', null)}
              date={notification.get('date', null)}
              isImageAccount={notification.get('isImageAccount', null)}
            />
          ))
        }
      </div>
    )

  }

}

const mapStateToProps = (state) => ({
  notifications: state.get('toasts')
})

ToastsContainer.propTypes = {
  notifications: ImmutablePropTypes.list.isRequired,
}

export default connect(mapStateToProps)(ToastsContainer)
