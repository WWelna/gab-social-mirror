import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import AccountGallery from './account_gallery'

const AccountPhotoGallery = ({ account }) =>
  !account || !account.get ? null :
  <AccountGallery account={account} title='Photos' mediaType='photo' />

AccountPhotoGallery.propTypes = { account: ImmutablePropTypes.map }

export default AccountPhotoGallery
