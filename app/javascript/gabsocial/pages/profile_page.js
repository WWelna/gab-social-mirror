import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { fetchAccountByUsername } from '../actions/accounts'
import { toggleAccountStatusAnyways } from '../actions/statuses'
import { makeGetAccount } from '../selectors'
import { me } from '../initial_state'
import PageTitle from '../features/ui/util/page_title'
import ColumnIndicator from '../components/column_indicator'
import Block from '../components/block'
import SensitiveMediaItem from '../components/sensitive_media_item'
import ProfileLayout from '../layouts/profile_layout'

class ProfilePage extends ImmutablePureComponent {

  state = {
    wantsToShowAnyways: false,
  }

  componentDidMount() {
    if (!this.props.account) {
      this.props.dispatch(fetchAccountByUsername(this.props.params.username))
    }
  }

  componentDidUpdate() {
    if (!this.props.account) {
      this.props.dispatch(fetchAccountByUsername(this.props.params.username))
    }
  }

  toggleShowAnyways = () => {
    const { wantsToShowAnyways } = this.state
    this.props.dispatch(toggleAccountStatusAnyways(this.props.accountId, !wantsToShowAnyways))
    this.setState({ wantsToShowAnyways: !wantsToShowAnyways })
  }

  render() {
    const {
      account,
      children,
      unavailable,
      noSidebar,
      isBlocked,
      isMe,
      isBlocking,
      isMuting,
      params: { username },
    } = this.props
    const { wantsToShowAnyways } = this.state

    const nameHTML = !!account ? account.get('display_name_html') : ''
    const name = !!account ? account.get('display_name_plain') : ''
    const unavailableMessage = (unavailable && isBlocked) ? <FormattedMessage id='empty_column.account_unavailable' defaultMessage='Profile unavailable' /> : <FormattedMessage id='empty_column.account_private' defaultMessage='This account is private. You must request to follow in order to view their page.' />
    const prependMessage = !unavailable && (isBlocking || isMuting) ? (
      <div className={[_s.d, _s.mb15].join(' ')}>
        <SensitiveMediaItem
          noPadding
          onClick={this.toggleShowAnyways}
          message={`You are ${isBlocking ? 'blocking' : 'muting'} @${username} so all of their posts are hidden for you.`}
          btnTitle={`${wantsToShowAnyways ? 'Hide' : 'View'} Profile`}
        />
      </div>
    ) : null

    return (
      <ProfileLayout
        account={account}
        titleHTML={nameHTML}
        unavailable={unavailable}
        noSidebar={noSidebar}
      >
        <PageTitle path={`${name} (@${username})`} />
        { prependMessage }
        {
          !unavailable &&
          React.cloneElement(children, {
            wantsToShowAnyways,
            account,
            isMe,
          })
        }
        {
          unavailable &&
          <Block>
            <ColumnIndicator type='error' message={unavailableMessage} />
          </Block>
        }
      </ProfileLayout>
    )
  }

}

const mapStateToProps = (state, { params: { username } }) => {
  const accounts = state.getIn(['accounts'])
  const account = accounts.find(acct => username.toLowerCase() === acct.getIn(['acct'], '').toLowerCase())

  const accountId = !!account ? account.get('id') : -1
  const isBlocked = state.getIn(['relationships', accountId, 'blocked_by'], false)
  const isBlocking = state.getIn(['relationships', accountId, 'blocking'], false)
  const isMuting = state.getIn(['relationships', accountId, 'muting'], false)
  const isLocked = state.getIn(['accounts', accountId, 'locked'], false)
  const isFollowing = state.getIn(['relationships', accountId, 'following'], false)

  const unavailable = (me === accountId) ? false : (isBlocked || (isLocked && !isFollowing))
  const isMe = me === accountId
  
  const getAccount = makeGetAccount()

  return {
    isMe,
    isBlocked,
    unavailable,
    isBlocking,
    isMuting,
    accountId,
    account: accountId !== -1 ? getAccount(state, accountId) : null,
  }
}

ProfilePage.propTypes = {
  account: ImmutablePropTypes.map,
  children: PropTypes.node,
  dispatch: PropTypes.func.isRequired,
  noSidebar: PropTypes.bool,
  params: PropTypes.object.isRequired,
  unavailable: PropTypes.bool.isRequired,
  isBlocked: PropTypes.bool.isRequired,
  isBlocking: PropTypes.bool.isRequired,
  isMuting: PropTypes.bool.isRequired,
}

export default connect(mapStateToProps)(ProfilePage)