import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import StatusList from '../components/status_list'
import Block from '../components/block'
import BlockHeading from '../components/block_heading'

function createParams({ page, items, queueResults }) {
  let op = { only_comments: true }

  if (!queueResults &&page !== undefined && page !== null) {
    op.page = null
    op.max_id = items[items.length - 1]
  }

  return op
}

const AccountCommentsTimeline = ({ account }) =>
  !account || !account.get ? null :
  (<Block>
    <BlockHeading title='Comments' />
    <StatusList
      timelineId={`account_comments:${account.get('id')}`}
      endpoint={`/api/v1/accounts/${account.get('id')}/statuses`}
      isComments
      queue
      createParams={createParams}
    />
  </Block>)

AccountCommentsTimeline.propTypes = { account: ImmutablePropTypes.map }

export default AccountCommentsTimeline;
