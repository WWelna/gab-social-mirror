import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import debounce from 'lodash/debounce'
import { autoPlayGif } from '../initial_state'
import { openPopoverDeferred, cancelPopover } from '../actions/popover'
import Image from './image'


/**
 * Renders an avatar component
 * @param {map} [props.account] - the account for image
 * @param {number} [props.size=40] - the size of the avatar
 */
class Avatar extends ImmutablePureComponent {

  state = { hovering: false }

  openUserInfo(evt) {
    // targetRef can be missing until the components set it
    const targetRef = this.imageRef || evt.target

    if (this.props.noHover) {
      // The avatar can be inside a popover and we don't want to open
      // another popover or jump the existing popover to different coordinates.
      return
    }

    if (!targetRef) {
      // it doesn't reliably get a ref
      return
    }

    this.setState({ hovering: true })

    this.props.openUserInfoPopover({
      targetRef,
      position: 'top',
      accountId: this.props.account.get('id'),
      timeout: 1500,
    })
  }

  handleMouseEnter = evt => this.openUserInfo(evt)
  handleMouseMove = evt => this.openUserInfo(evt)
  handleMouseLeave = () => this.props.onCancelPopover()
  setImageRef = el => this.imageRef = el

  render() {
    const {
      account,
      expandOnClick,
      size,
      isStatic,
    } = this.props
    const { hovering } = this.state

    const isPro = !!account ? account.get('is_pro') : false
    const displayName = !!account ? account.get('display_name') || account.get('username') : ''
    const alt = (!isStatic || !account) ? '' : `${displayName} ${isPro ? '(PRO)' : ''}`.trim()
    const classes = [_s.d, _s.circle, _s.overflowHidden]
    if (isPro) {
      classes.push(_s.boxShadowAvatarPro)
    }

    let src;

    if (account) {
      const srcKeyBase = hovering || autoPlayGif ? 'avatar' : 'avatar_static'
      // const srcKey = size <= 50 ? `${srcKeyBase}_small` : srcKeyBase
      const srcKey = srcKeyBase

      src = account.get(srcKey)
    }
    
    return (
      <Image
        src={src}
        alt={alt}
        imageRef={this.setImageRef}
        className={classes.join(' ')}
        expandOnClick={isStatic ? null : expandOnClick}
        onMouseEnter={isStatic ? null : this.handleMouseEnter}
        onMouseMove={isStatic ? null : this.handleMouseMove}
        onMouseLeave={isStatic ? null : this.handleMouseLeave}
        width={size}
        height={size}
      />
    )
  }

}

const mapDispatchToProps = (dispatch) => ({
  openUserInfoPopover(props) {
    dispatch(openPopoverDeferred('USER_INFO', props))
  },
  onCancelPopover() {
    dispatch(cancelPopover())
  }
})

Avatar.propTypes = {
  account: ImmutablePropTypes.map,
  noHover: PropTypes.bool,
  openUserInfoPopover: PropTypes.func.isRequired,
  onCancelPopover: PropTypes.func.isRequired,
  expandOnClick: PropTypes.bool,
  size: PropTypes.number,
}

Avatar.defaultProps = {
  size: 40,
}

export default connect(null, mapDispatchToProps)(Avatar)
