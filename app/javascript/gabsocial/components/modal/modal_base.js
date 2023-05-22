import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'
import { CX, BREAKPOINT_EXTRA_SMALL } from '../../constants'

const hasChildren = children =>
  children !== false && React.Children.count(children) > 0

class ModalBase extends React.PureComponent {
  get visible() {
    return hasChildren(this.props.children)
  }

  handleKeyUp = e => {
    if (
      (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) &&
      this.visible
    ) {
      this.handleOnClose()
    }
  }

  handleOnClose = (e, force) => {
    if (!!e && this.dialog !== e.target && !force) return
    if (
      e &&
      e.target &&
      typeof e.target.getAttribute === 'function' &&
      typeof e.target.isSameNode === 'function' &&
      e.target.getAttribute('role') === 'dialog' &&
      this.downTarget &&
      this.upTarget &&
      e.target.isSameNode(this.upTarget) &&
      !e.target.isSameNode(this.downTarget)
    ) {
      // user was selecting or mousing in the composer, moved out of the modal
      // previously it would close it, now we prevent closing.
      return
    }

    this.props.onClose()
  }

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeyUp, false)
    window.addEventListener('popstate', e => this.handleOnClose(e, true), false)
    document.body.addEventListener('mousedown', this.bodyMouseDown)
    document.body.addEventListener('mouseup', this.bodyMouseUp)
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp)
    window.removeEventListener('popstate', this.handleOnClose, false)
    document.body.removeEventListener('mousedown', this.bodyMouseDown)
    document.body.removeEventListener('mousedown', this.bodyMouseUp)
  }

  componentDidUpdate(prevProps) {
    // if page location changes, immediately close modal
    if (prevProps.location !== this.props.location) {
      this.props.onClose()
    }
  }

  setRef = ref => (this.node = ref)
  setDialog = ref => (this.dialog = ref)
  bodyMouseDown = evt => (this.downTarget = evt.target)
  bodyMouseUp = evt => (this.upTarget = evt.target)

  render() {
    const { visible } = this
    const { children, isCenteredXS, width } = this.props
    const isXS = width <= BREAKPOINT_EXTRA_SMALL
    // const visible = children !== undefined && children !== null

    const containerClasses = CX({
      d: 1,
      z4: 1,
      h100PC: visible,
      w100PC: visible,
      displayNone: !visible
    })

    const dialogClasses = CX({
      d: 1,
      posFixed: 1,
      aiCenter: 1,
      jcCenter: !isXS || isCenteredXS,
      jcEnd: isXS && !isCenteredXS,
      z4: 1,
      w100PC: 1,
      h100PC: 1,
      top0: 1,
      rightAuto: 1,
      bottomAuto: 1,
      left0: 1
    })

    return (
      <div ref={this.setRef} className={containerClasses}>
        {visible && (
          <>
            <div
              role="presentation"
              className={[
                _s.d,
                _s.bgBlackOpaque,
                _s.posFixed,
                _s.z3,
                _s.top0,
                _s.right0,
                _s.bottom0,
                _s.left0
              ].join(' ')}
            />
            <div
              ref={this.setDialog}
              role="dialog"
              onClick={this.handleOnClose}
              className={dialogClasses}
            >
              {children}
            </div>
          </>
        )}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  width: state.getIn(['settings', 'window_dimensions', 'width'])
})

ModalBase.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.string,
  isCenteredXS: PropTypes.bool
}

/**
 * Allow using ModalBase without redux or react-router in the account section.
*/
export const ModalBaseRaw = ModalBase

export default withRouter(injectIntl(connect(mapStateToProps)(ModalBase)))
