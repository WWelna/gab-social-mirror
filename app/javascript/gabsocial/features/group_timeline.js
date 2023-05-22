import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Map as ImmutableMap } from 'immutable';
import get from 'lodash.get'
import StatusList from '../components/status_list'
import GroupSortBlock from '../components/group_sort_block'
import {
  GROUP_TIMELINE_SORTING_TYPE_TOP,
  groupSorts,
  groupSortTops,
} from '../constants'

function createParams({ sortByValue, sortByTopValue }) {
  if (sortByValue === GROUP_TIMELINE_SORTING_TYPE_TOP) {
    // see app/controllers/api/v1/timelines/group_controller.rb
    return { sort_by: `top_${sortByTopValue}` }
  }
  return { sort_by: sortByValue }
}

function GroupTimeline({ params, isAdminOrMod, groupCategory }) {
  const timelineId = `group:${params.id}`
  return (<>
    <GroupSortBlock timelineId={timelineId} />
    <StatusList
      timelineId={timelineId}
      endpoint={`/api/v1/timelines/group/${params.id}`}
      pinsEndpoint={`/api/v1/timelines/group_pins/${params.id}`}
      showPins
      showAds
      sorts={groupSorts}
      topSorts={groupSortTops}
      createParams={createParams}
      disableCanShow={isAdminOrMod}
      groupCategory={groupCategory}
    />
  </>)
}

GroupTimeline.propTypes = { params: PropTypes.object }

function mapStateToProps(state, props) {
  const groupId = get(props, 'params.id')
  if (!groupId) return {}
  let groupCategory
  const groupState = state.getIn(['groups', groupId])
  if (groupState && ImmutableMap.isMap(groupState)) {
    const groupStateJs = groupState.toJS()
    if (groupStateJs && groupStateJs.group_category && groupStateJs.group_category.text && groupStateJs.group_category.text != '') {
      groupCategory = groupStateJs.group_category.text
    }
  }
  const relationship = state.getIn(['group_relationships', groupId])
  const isAdminOrMod = ImmutableMap.isMap(relationship) &&
    (relationship.get('admin') || relationship.get('moderator'))
  return { isAdminOrMod, groupCategory }
}

export default connect(mapStateToProps)(GroupTimeline);
