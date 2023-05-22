import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import StatusList from '../components/status_list'

function createParams({ page, items, queueResults }) {
  let op = {}

  if (!queueResults &&page !== undefined && page !== null) {
    op.page = null
    op.max_id = items[items.length - 1]
  }

  return op
}

const AccountTimeline = ({ account }) =>
  !account || !account.get ? null :
  (<StatusList
    scrollKey='account_timeline'
    timelineId={`account:${account.get('id')}`}
    endpoint={`/api/v1/accounts/${account.get('id')}/statuses`}
    showPins
    queue
    createParams={createParams}
  />)

AccountTimeline.propTypes = { account: ImmutablePropTypes.map }

export default AccountTimeline;
