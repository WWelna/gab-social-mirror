import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import StatusList from '../components/status_list'
import BlockHeading from '../components/block_heading'

const AccountCommentsTimeline = ({ account }) =>
  !account || !account.get ? null :
  (<>
    <BlockHeading title='Comments' />
    <StatusList
      timelineId={`account_comments:${account.get('id')}`}
      endpoint={`/api/v1/accounts/${account.get('id')}/statuses`}
      isComments
    />
  </>)

AccountCommentsTimeline.propTypes = { account: ImmutablePropTypes.map }

export default AccountCommentsTimeline;
