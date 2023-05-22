import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { injectIntl, defineMessages } from 'react-intl'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { me } from '../../initial_state'
import { makeGetAccount } from '../../selectors'
import { shortNumberFormat } from '../../utils/numbers'
import { openModal } from '../../actions/modal'
import {
  CX,
  MODAL_EDIT_PROFILE,
  PLACEHOLDER_MISSING_HEADER_SRC,
} from '../../constants'
import PanelLayout from './panel_layout'
import Avatar from '../avatar'
import Button from '../button'
import DisplayName from '../display_name'
import Image from '../image'
import UserStat from '../user_stat'

class UserPanel extends ImmutablePureComponent {

  state = {
    hovering: false,
  }

  updateOnProps = [
    'account'
  ]

  handleOnMouseEnter = () => {
    this.setState({ hovering: true })
  }

  handleOnMouseLeave = () => {
    this.setState({ hovering: false })
  }

  handleOnEditProfile = () => {
    this.props.onOpenEditProfile()
  }

  render() {
    const {
      account,
      intl,
      onOpenEditProfile,
    } = this.props
    const { hovering } = this.state

    const acct = account.get('acct')
    const headerSrc = !!account ? account.get('header') : undefined
    const headerMissing = !headerSrc ? true : headerSrc.indexOf(PLACEHOLDER_MISSING_HEADER_SRC) > -1

    const buttonClasses = CX({
      posAbs: 1,
      mr10: 1,
      top0: 1,
      right0: 1,
      mt10: 1,
      displayNone: !hovering,
    })

    const headerContainerClasses = CX({
      d: 1,
      h122PX: !headerMissing,
      h55PX: headerMissing,
      bgSecondary: headerMissing,
    })

    return (
      <PanelLayout key='user-panel' noPadding>
        <div
          className={headerContainerClasses}
          onMouseEnter={this.handleOnMouseEnter}
          onMouseLeave={this.handleOnMouseLeave}
        >
          {
            !headerMissing &&
            <Image
              alt={intl.formatMessage(messages.headerPhoto)}
              className={_s.h122PX}
              src={account.get('header_static')}
            />
          }
          <Button
            color='secondary'
            backgroundColor='secondary'
            radiusSmall
            className={buttonClasses}
            onClick={this.handleOnEditProfile}
          >
            {intl.formatMessage(messages.edit_profile)}
          </Button>
        </div>

        <NavLink
          className={[_s.d, _s.flexRow, _s.py10, _s.px15, _s.noUnderline].join(' ')}
          to={`/${acct}`}
        >
          <div className={[_s.d, _s.mtNeg32PX, _s.circle, _s.borderColorPrimary, _s.border6PX].join(' ')}>
            <Avatar account={account} size={62} noHover />
          </div>
          <div className={[_s.d, _s.ml15].join(' ')}>
            <DisplayName account={account} isMultiline noRelationship noHover />
          </div>
        </NavLink>

        <div className={[_s.d, _s.mb15, _s.mt5, _s.flexRow, _s.px15].join(' ')}>
          <UserStat
            to={`/${acct}`}
            title={intl.formatMessage(messages.gabs)}
            numvalue={account.get('statuses_count')}
            value={shortNumberFormat(account.get('statuses_count'))}
          />
          <UserStat
            to={`/${acct}/followers`}
            title={intl.formatMessage(messages.followers)}
            numvalue={account.get('followers_count')}
            value={shortNumberFormat(account.get('followers_count'))}
          />
          <UserStat
            to={`/${acct}/following`}
            title={intl.formatMessage(messages.follows)}
            numvalue={account.get('following_count')}
            value={shortNumberFormat(account.get('following_count'))}
          />
        </div>
      </PanelLayout>
    )
  }

}

const messages = defineMessages({
  gabs: { id: 'account.posts', defaultMessage: 'Gabs' },
  followers: { id: 'account.followers', defaultMessage: 'Followers' },
  follows: { id: 'account.follows', defaultMessage: 'Following' },
  edit_profile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
  headerPhoto: { id: 'header_photo', defaultMessage: 'Header photo' },
})

const mapStateToProps = (state) => ({
  account: makeGetAccount()(state, me),
})

const mapDispatchToProps = (dispatch) => ({
  onOpenEditProfile() {
    dispatch(openModal(MODAL_EDIT_PROFILE))
  },
})

UserPanel.propTypes = {
  account: ImmutablePropTypes.map.isRequired,
  intl: PropTypes.object.isRequired,
  onOpenEditProfile: PropTypes.func.isRequired,
}


export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(UserPanel))
