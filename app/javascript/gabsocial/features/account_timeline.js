import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import GroupSortBlock from '../components/group_sort_block'
import StatusList from '../components/status_list'
import {
  EXPLORE_SORT_CREATE_PARAMS,
  ACCOUNT_TIMELINE_SORTS,
  GROUP_SORT_TOPS,
} from '../constants'

// experiment...
// function createParams(options) {
//   const { page, items, queueResults } = options
  
//   const result = EXPLORE_SORT_CREATE_PARAMS(options)
//   const op = { ...result }

//   if (!queueResults && page !== undefined && page !== null) {
//     op.page = null
//     op.max_id = items[items.length - 1]
//   }

//   return op
// }

function AccountTimeline({ account }) {
  if (!account || !account.get) return null
  const timelineId = `account:${account.get('id')}`
  return (
    <>
      <GroupSortBlock timelineId={timelineId} />
      <StatusList
        scrollKey='account_timeline'
        timelineId={timelineId}
        endpoint={`/api/v1/accounts/${account.get('id')}/statuses`}
        showPins
        queue
        sorts={ACCOUNT_TIMELINE_SORTS}
        topSorts={GROUP_SORT_TOPS}
        createParams={EXPLORE_SORT_CREATE_PARAMS}
      />
    </>
  )
}

AccountTimeline.propTypes = {
  account: ImmutablePropTypes.map,
}

export default AccountTimeline
