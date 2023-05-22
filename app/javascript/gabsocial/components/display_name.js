import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import debounce from 'lodash/debounce'
import { me } from '../initial_state'
import {
  CX,
  POPOVER_USER_INFO,
} from '../constants'
import { openPopoverDeferred, cancelPopover } from '../actions/popover'
import Icon from './icon'
import Text from './text'

class DisplayName extends ImmutablePureComponent {

  openUserInfo(evt) {
    // targetRef can be missing until the components set it
    const targetRef = this.displayNameRef || evt.target

    if (this.props.noHover) {
      // The display name can be inside a popover and we don't want to open
      // another popover or jump the existing popover to different coordinates.
      return
    }

    if (!targetRef) {
      // it doesn't reliably get a ref
      return
    }

    this.props.openUserInfoPopover({
      targetRef,
      position: 'top-start',
      accountId: this.props.account.get('id'),
      timeout: 1500
    })
  }

  handleMouseEnter = evt => this.openUserInfo(evt)
  handleMouseMove = evt => this.openUserInfo(evt)
  handleMouseLeave = () => this.props.onCancelPopover()
  setDisplayNameRef = el => this.displayNameRef = el

  render() {
    const {
      account,
      isMultiline,
      isGrouped,
      isLarge,
      noHover,
      noDisplayName,
      noUsername,
      noRelationship,
      isSmall,
      isComment,
      isCentered,
      isInline,
    } = this.props

    if (!account) return null

    const containerClassName = CX({
      d: !isGrouped,
      maxW100PC: 1,
      aiCenter: !isMultiline,
      flexRow: !isMultiline,
      cursorPointer: !noHover,
      aiCenter: isCentered,
      displayInlineBlock: isInline,
    })

    const displayNameClasses = CX({
      text: 1,
      overflowWrapBreakWord: 1,
      whiteSpaceNoWrap: 1,
      fw600: 1,
      cPrimary: 1,
      mr2: 1,
      lineHeight125: !isSmall,
      fs14PX: isSmall,
      fs15PX: !isLarge,
      fs24PX: isLarge && !isSmall,
    })

    const usernameClasses = CX({
      text: 1,
      displayFlex: isMultiline,
      whiteSpaceNoWrap: 1,
      textOverflowEllipsis2: 1,
      overflowHidden: 1,
      cSecondary: !noDisplayName,
      cPrimary: noDisplayName,
      fw400: !noDisplayName,
      fw600: noDisplayName,
      lineHeight15: isMultiline,
      lineHeight125: !isMultiline,
      ml5: !isMultiline && !noDisplayName,
      fs14PX: isSmall,
      fs15PX: !isLarge,
      fs16PX: isLarge && !isSmall,
    })

    const iconSize =
      !!isLarge ? 19 :
      !!isComment ? 12 :
      !!isSmall ? 14 : 15

    let relationshipLabel
    let isMuting = false
    if (me && account) {
      const accountId = account.get('id')
      const isFollowedBy = (me !==  accountId && account.getIn(['relationship', 'followed_by']))
      isMuting = account.getIn(['relationship', 'muting'])

      if (isFollowedBy) {
        relationshipLabel = 'Follows you'
      }
    }

    return (
      <div
        ref={this.setDisplayNameRef}
        className={containerClassName}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
        onMouseLeave={this.handleMouseLeave}
      >
        {
          !noDisplayName &&
          <span className={[_s.d, _s.flexRow, _s.aiCenter, _s.maxW100PC, _s.flexShrink0, _s.overflowHidden, _s.cPrimary].join(' ')}>
            <bdi className={[_s.text, _s.whiteSpaceNoWrap, _s.textOverflowEllipsis].join(' ')}>
              <strong
                className={displayNameClasses}
                dangerouslySetInnerHTML={{ __html: account.get('display_name_html') }}
              />
              {
                account.get('locked') &&
                <Icon id='lock-filled' size={`${iconSize - 3}px`} className={[_s.cPrimary, _s.ml5].join(' ')} />
              }
              {
                isMuting &&
                <Icon id='audio-mute' size={`${iconSize - 3}px`} className={[_s.cPrimary, _s.ml7].join(' ')} />
              }
            </bdi>
            {
              account.get('is_verified') &&
              <Icon id='verified-account' size={`${iconSize}px`} className={[_s.ml5, _s.d].join(' ')} />
            }
          </span>
        }
        {
          !noUsername &&
          <span className={usernameClasses}>
            @{account.get('acct')}
            {
              !noRelationship && !!relationshipLabel &&
              <span className={[_s.d, _s.ml5, _s.jcCenter].join(' ')}>
                <Text
                  size='extraSmall'
                  isBadge
                  color='secondary'
                  className={[_s.bgSecondary, _s.py2].join(' ')}
                >
                  {relationshipLabel}
                </Text>
              </span>
            }
          </span>
        }
      </div>
    )
  }

}

const mapDispatchToProps = (dispatch) => ({
  openUserInfoPopover(props) {
    dispatch(openPopoverDeferred(POPOVER_USER_INFO, props))
  },
  onCancelPopover() {
    dispatch(cancelPopover())
  }
})

DisplayName.propTypes = {
  account: ImmutablePropTypes.map,
  openUserInfoPopover: PropTypes.func.isRequired,
  onCancelPopover: PropTypes.func.isRequired,
  isLarge: PropTypes.bool,
  isMultiline: PropTypes.bool,
  isSmall: PropTypes.bool,
  noHover: PropTypes.bool,
  noRelationship: PropTypes.bool,
  noUsername: PropTypes.bool,
  noDisplayName: PropTypes.bool,
  isComment: PropTypes.bool,
  isCentered: PropTypes.bool,
  isInline: PropTypes.bool,
  isGrouped: PropTypes.bool,
}

export default (connect(null, mapDispatchToProps)(DisplayName))
