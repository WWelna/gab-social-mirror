import { defineMessages, injectIntl } from 'react-intl'
import {  MODAL_DISPLAY_OPTIONS } from '../../constants'
import { openModal } from '../../actions/modal'
import { closePopover } from '../../actions/popover'
import { meUsername } from '../../initial_state'
import PopoverLayout from './popover_layout'
import List from '../list'

const messages = defineMessages({
  profile: { id: 'account.profile', defaultMessage: 'Profile' },
  display: { id: 'display_options', defaultMessage: 'Display Options' },
  help: { id: 'getting_started.help', defaultMessage: 'Help' },
  settings: { id: 'settings', defaultMessage: 'Settings' },
  logout: { 'id': 'confirmations.logout.confirm', 'defaultMessage': 'Log out' },
})

const mapDispatchToProps = (dispatch) => ({
  onOpenDisplayModal: () => {
    dispatch(closePopover())
    dispatch(openModal(MODAL_DISPLAY_OPTIONS))
  },
})

export default
@injectIntl
@connect(null, mapDispatchToProps)
class NavSettingsPopover extends PureComponent {
  
  static propTypes = {
    intl: PropTypes.object.isRequired,
    onOpenDisplayModal: PropTypes.func.isRequired,
    isXS: PropTypes.bool,
  }

  handleOnOpenDisplayModal = () => {
    this.props.onOpenDisplayModal()
  }

  render() {
    const { intl, isXS } = this.props

    if (isXS) return null

    return (
      <PopoverLayout width={240}>
        <List
          size='large'
          scrollKey='profile_options'
          items={[
            {
              title: intl.formatMessage(messages.profile),
              to: `/${meUsername}`
            },
            {
              title: intl.formatMessage(messages.help),
              href: 'https://help.gab.com',
            },
            {
              title: intl.formatMessage(messages.settings),
              href: '/settings/preferences',
            },
            {
              title: intl.formatMessage(messages.logout),
              href: '/auth/sign_out',
            },
          ]}
        />
      </PopoverLayout>
    )
  }
}