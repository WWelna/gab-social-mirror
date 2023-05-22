import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import AccountGallery from './account_gallery'

const AccountVideo = ({ account }) =>
  !account || !account.get ? null :
  <AccountGallery account={account} title='Videos' mediaType='video' />

AccountVideo.propTypes = { account: ImmutablePropTypes.map }

export default AccountVideo
