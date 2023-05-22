import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { saveUserProfileInformation } from '../../actions/user'
import { me } from '../../initial_state'
import Button from '../button'
import Block from '../block'
import Divider from '../divider'
import FileInput from '../file_input'
import Input from '../input'
import Switch from '../switch'
import Heading from '../heading'
import Text from '../text'
import Textarea from '../textarea'

class EditProfileModal extends ImmutablePureComponent {

  state = {
    avatarSrc: this.props.account ? this.props.account.get('avatar_static') : undefined,
    bioValue: this.props.account ? this.props.account.get('note_plain') : '',
    displayNameValue: this.props.account ? this.props.account.get('display_name_plain') : '',
    headerSrc: this.props.account ? this.props.account.get('header_static') : undefined,
    locked: this.props.account ? this.props.account.get('locked') : false,
  }

  componentDidMount() {
    if (this.props.embedded) {
      window.addEventListener('profile-save', this.handleOnSave)
    }
  }

  componentWillUnmount() {
    if (this.props.embedded) {
      window.removeEventListener('profile-save', this.handleOnSave)
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.account !== this.props.account) {
      if (this.props.account) {
        this.setState({
          avatarSrc: this.props.account.get('avatar_static'),
          bioValue: this.props.account.get('note_plain'),
          displayNameValue: this.props.account.get('display_name_plain'),
          headerSrc: this.props.account.get('header_static'),
          locked: this.props.account.get('locked'),
        })
      } else {
        this.setState({
          avatarSrc: undefined,
          bioValue: '',
          displayNameValue: '',
          headerSrc: undefined,
          locked: false,
        })
      }
    }
  }

  handleCoverPhotoChange = (e) => {
    try {
      this.setState({ headerSrc: e.target.files[0] })
    } catch (error) {
      // 
    }
  }

  handleProfilePhotoChange = (e) => {
    try {
      this.setState({ avatarSrc: e.target.files[0] })
    } catch (error) {
      // 
    }
  }

  handleDisplayNameChange = (value) => {
    this.setState({ displayNameValue: value })
  }

  handleBioChange = (value) => {
    this.setState({ bioValue: value })
  }

  handleLockedChange = (locked) => {
    this.setState({ locked })
  }

  handleOnClose = () => {
    // when embedded there isn't any onClose
    const { onClose } = this.props
    if (onClose) {
      onClose()
    }
  }

  handleOnSave = evt => {
    const { account } = this.props
    const {
      avatarSrc,
      bioValue,
      displayNameValue,
      headerSrc,
      locked,
    } = this.state

    const isVerified = account.get('is_verified')

    const obj = {}
    obj.locked = locked
    if (!isVerified && account.get('display_name_plain') !== displayNameValue) obj.displayName = displayNameValue
    if (account.get('note_plain') !== bioValue) obj.note = bioValue
    if (account.get('avatar_static') !== avatarSrc) obj.avatar = avatarSrc
    if (account.get('header_static') !== headerSrc) obj.header = headerSrc

    this.props.onSave(obj, this.handleOnClose)
    this.handleOnClose()
  }

  render() {
    const { intl, account } = this.props
    const {
      avatarSrc,
      bioValue,
      displayNameValue,
      headerSrc,
      locked,
    } = this.state

    const isVerified = account.get('is_verified')

    /*
    If embedded we can just display the form and not the modal, border, "X",
    and "save" button. This would be nicer if put into a separate component
    but for expediency we added a prop toggle.
    */
    const inner = (
      <div className={[_s.d, _s.w100PC, _s.aiCenter].join(' ')}>
        <FileInput
          width='480px'
          height='180px'
          id='cover-photo'
          onChange={this.handleCoverPhotoChange}
          file={headerSrc}
        />
        <div className={[_s.d, _s.mtNeg50PX, _s.aiCenter, _s.jcCenter].join(' ')}>
          <FileInput
            width='132px'
            height='132px'
            id='profile-photo'
            file={avatarSrc}
            className={[_s.circle, _s.border6PX, _s.borderColorWhite, _s.bgPrimary].join(' ')}
            onChange={this.handleProfilePhotoChange}
          />
        </div>
        <div className={[_s.d, _s.py5, _s.mt5, _s.mb15, _s.w100PC].join(' ')}>
          <div className={[_s.d, _s.mb10, _s.px15].join(' ')}>
            <div className={[_s.d, _s.pl15].join(' ')}>
              <Text htmlFor='display-name' size='small' weight='medium' color='secondary' tagName='label'>
                Display name
              </Text>
              {
                isVerified &&
                <Text htmlFor='display-name' size='extraSmall' color='secondary' tagName='label' className={[_s.mt5, _s.mb10].join(' ')}>
                  (Verified accounts cannot change display names.)
                </Text>
              }
            </div>
            <Input
              id='display-name'
              maxLength={30}
              value={displayNameValue}
              isDisabled={isVerified}
              readOnly={isVerified}
              onChange={this.handleDisplayNameChange}
              onBlur={this.handleDisplayNameBlur}
            />
          </div>

          <Divider />
            
          <div className={[_s.d, _s.mb10, _s.px15].join(' ')}>
            <Textarea
              title='Bio'
              value={bioValue}
              disabled={false}
              maxLength={500}
              onChange={this.handleBioChange}
              placeholder='Add your bio...'
            />
          </div>

          <Divider />

          <div className={[_s.d, _s.mb10, _s.pl25, _s.pr15].join(' ')}>
            <Switch
              label='Private account'
              checked={locked}
              onChange={this.handleLockedChange}
            />
          </div>

        </div>
      </div>
    )

    if (this.props.embedded) {
      return inner
    }

    return (
      <div style={{ width: '480px' }} className={[_s.d, _s.modal].join(' ')}>
        <Block>
          <div className={[_s.d, _s.flexRow, _s.aiCenter, _s.jcCenter, _s.borderBottom1PX, _s.borderColorSecondary, _s.h53PX, _s.pr10].join(' ')}>
            <Button
              backgroundColor='none'
              title={intl.formatMessage(messages.close)}
              className={[_s.mrAuto, _s.w60PX, _s.pl0].join(' ')}
              onClick={this.handleOnClose}
              color='secondary'
              icon='close'
              iconSize='10px'
            />
            <Heading size='h2'>
              {intl.formatMessage(messages.edit_profile)}
            </Heading>
            <Button
              radiusSmall
              title={intl.formatMessage(messages.save)}
              className={[_s.mlAuto, _s.w72PX, _s.aiCenter].join(' ')}
              onClick={this.handleOnSave}
            >
              <Text color='inherit' weight='medium'>
                {intl.formatMessage(messages.save)}
              </Text>
            </Button>
          </div>
          <div className={[_s.d, _s.maxH80VH, _s.overflowYScroll].join(' ')}>
            {inner}
          </div>
        </Block>
      </div>
    )
  }
}

const messages = defineMessages({
  edit_profile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
  headerPhoto: { id: 'header_photo', defaultMessage: 'Header photo' },
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  save: { id: 'lightbox.save', defaultMessage: 'Save' },
})

const mapStateToProps = (state) => ({
  account: state.getIn(['accounts', me]),
})

const mapDispatchToProps = (dispatch) => ({
  onSave: (data, closer) => dispatch(saveUserProfileInformation(data, closer)),
})

EditProfileModal.propTypes = {
  account: ImmutablePropTypes.map,
  intl: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  embedded: PropTypes.bool
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(EditProfileModal))
