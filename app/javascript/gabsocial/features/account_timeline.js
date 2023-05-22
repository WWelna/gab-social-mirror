import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import StatusList from '../components/status_list'

const AccountTimeline = ({ account }) =>
  !account || !account.get ? null :
  (<StatusList
    scrollKey='account_timeline'
    timelineId={`account:${account.get('id')}`}
    endpoint={`/api/v1/accounts/${account.get('id')}/statuses`}
    showPins
    queue
  />)

AccountTimeline.propTypes = { account: ImmutablePropTypes.map }

export default AccountTimeline;
