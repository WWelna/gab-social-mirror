import { Map as ImmutableMap, List as ImmutableList, fromJS } from 'immutable'
import compareId from '../utils/compare_id'
import {
  TIMELINE_UPDATE,
  TIMELINE_DELETE,
  TIMELINE_CLEAR,
  TIMELINE_EXPAND_SUCCESS,
  TIMELINE_EXPAND_REQUEST,
  TIMELINE_EXPAND_FAIL,
  TIMELINE_CONNECT,
  TIMELINE_DISCONNECT,
  TIMELINE_UPDATE_QUEUE,
  TIMELINE_DEQUEUE,
  MAX_QUEUED_ITEMS,
  TIMELINE_SCROLL_TOP,
  HOME_TIMELINE_SORT,
} from '../actions/timelines'
import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
  ACCOUNT_UNFOLLOW_SUCCESS,
} from '../actions/accounts'
import {
  GROUP_REMOVE_STATUS_SUCCESS,
  GROUP_UNPIN_STATUS_SUCCESS,
} from '../actions/groups'
import { UNPIN_SUCCESS } from '../actions/interactions'

const initialState = ImmutableMap()

const initialTimeline = ImmutableMap({
  unread: 0,
  online: false,
  top: true,
  isLoading: false,
  isError: false,
  hasMore: true,
  sortByValue: null,
  items: ImmutableList(),
  queuedItems: ImmutableList(), //max= MAX_QUEUED_ITEMS
  totalQueuedItemsCount: 0, //used for queuedItems overflow for MAX_QUEUED_ITEMS+
})

const expandNormalizedTimeline = (state, timeline, statuses, next, isPartial, isLoadingRecent) => {
  return state.update(timeline, initialTimeline, map => map.withMutations((mMap) => {
    mMap.set('isLoading', false)
    mMap.set('isPartial', isPartial)

    if (!next && !isLoadingRecent) mMap.set('hasMore', false)

    if (timeline.endsWith(':pinned')) {
      mMap.set('items', statuses.map(status => status.get('id')));
    } else if (!statuses.isEmpty()) {
      mMap.update('items', ImmutableList(), oldIds => {
        const newIds = statuses.map(status => status.get('id'));

        // const realtime = ['home']
        // if no realtime, do all that, otherwise just concat
        // return oldIds.concat(newIds);

        const lastIndex = oldIds.findLastIndex(id => id !== null && compareId(id, newIds.last()) >= 0) + 1;
        const firstIndex = oldIds.take(lastIndex).findLastIndex(id => id !== null && compareId(id, newIds.first()) > 0);

        if (firstIndex < 0) {
          return (isPartial ? newIds.unshift(null) : newIds).concat(oldIds.skip(lastIndex));
        }

        return oldIds.take(firstIndex + 1).concat(
          isPartial && oldIds.get(firstIndex) !== null ? newIds.unshift(null) : newIds,
          oldIds.skip(lastIndex)
        );
      });
    }
  }));
};

const updateTimeline = (state, timeline, status) => {
  const top        = state.getIn([timeline, 'top']);
  const ids        = state.getIn([timeline, 'items'], ImmutableList());
  const includesId = ids.includes(status.get('id'));
  const unread     = state.getIn([timeline, 'unread'], 0);

  if (includesId) {
    return state;
  }

  let newIds = ids;

  return state.update(timeline, initialTimeline, map => map.withMutations(mMap => {
    if (!top) mMap.set('unread', unread + 1);
    if (top && ids.size > 40) newIds = newIds.take(20);
    mMap.set('items', newIds.unshift(status.get('id')));
  }));
};

const updateTimelineQueue = (state, timeline, status) => {
  const queuedStatuses = state.getIn([timeline, 'queuedItems'], ImmutableList());
  const listedStatuses = state.getIn([timeline, 'items'], ImmutableList());
  const totalQueuedItemsCount = state.getIn([timeline, 'totalQueuedItemsCount'], 0);

  let alreadyExists = queuedStatuses.find(existingQueuedStatus => existingQueuedStatus.get('id') === status.get('id'));
  if (!alreadyExists) alreadyExists = listedStatuses.find(existingListedStatusId => existingListedStatusId === status.get('id'));

  const isReply = !!status.get('in_reply_to_id')
  if (alreadyExists || isReply) {
    return state;
  }

  let newQueuedStatuses = queuedStatuses;

  return state.update(timeline, initialTimeline, map => map.withMutations(mMap => {
    if (totalQueuedItemsCount <= MAX_QUEUED_ITEMS) {
      mMap.set('queuedItems', newQueuedStatuses.push(status));
    }
    mMap.set('totalQueuedItemsCount', totalQueuedItemsCount + 1);
  }));
};

const deleteStatus = (state, id, accountId, references, exclude_account = null) => {
  state.keySeq().forEach(timeline => {
    if (exclude_account === null || (!!timeline && timeline !== `account:${exclude_account}` && !timeline.startsWith(`account:${exclude_account}:`)))
      state = state.updateIn([timeline, 'items'], list => list.filterNot(item => item === id));
  });

  // Remove reblogs of deleted status
  references.forEach(ref => {
    state = deleteStatus(state, ref[0], ref[1], [], exclude_account);
  });

  return state;
};

const clearTimeline = (state, timeline) => {
  // keep sortByValue
  const existingSortByValue = state.getIn([timeline, 'sortByValue'], null)
  return state.set(timeline, initialTimeline).setIn([timeline, 'sortByValue'], existingSortByValue)
}

const filterTimelines = (state, relationship, statuses) => {
  let references;

  statuses.forEach(status => {
    if (status.get('account') !== relationship.id) {
      return;
    }

    references = statuses.filter(item => item.get('reblog') === status.get('id')).map(item => [item.get('id'), item.get('account')]);
    state      = deleteStatus(state, status.get('id'), status.get('account'), references, relationship.id);
  });

  return state;
};

const updateTop = (state, timeline, top) => {
  return state.update(timeline, initialTimeline, map => map.withMutations(mMap => {
    if (top) mMap.set('unread', 0);
    mMap.set('top', top);
  }));
};

const filterTimeline = (timeline, state, relationship, statuses) =>
  state.updateIn([timeline, 'items'], ImmutableList(), list =>
    list.filterNot(statusId =>
      statuses.getIn([statusId, 'account']) === relationship.id
    ));

const removeStatusFromGroup = (state, groupId, statusId) => {
  return state.updateIn([`group:${groupId}`, 'items'], list => list.filterNot(item => item === statusId))
}

const removeStatusFromGroupPins = (state, groupId, statusId) => {
  return state.updateIn([`group:${groupId}:pinned`, 'items'], list => list.filterNot(item => item === statusId))
}

const removeStatusFromAccountPins = (state, accountId, statusId) => {
  return state.updateIn([`account:${accountId}:pinned`, 'items'], list => list.filterNot(item => item === statusId))
}

export default function timelines(state = initialState, action) {
  switch(action.type) {
  case TIMELINE_EXPAND_REQUEST:
    return state.update(action.timeline, initialTimeline, map => map.set('isLoading', true));
  case TIMELINE_EXPAND_FAIL:
    return state.update(action.timeline, initialTimeline, map => map.withMutations(mMap => {
      mMap.set('isLoading', false)
      mMap.set('isError', true)
    }));
  case TIMELINE_EXPAND_SUCCESS:
    return expandNormalizedTimeline(state, action.timeline, fromJS(action.statuses), action.next, action.partial, action.isLoadingRecent);
  case TIMELINE_UPDATE:
    return updateTimeline(state, action.timeline, fromJS(action.status));
  case TIMELINE_UPDATE_QUEUE:
    return updateTimelineQueue(state, action.timeline, fromJS(action.status));
  case TIMELINE_DEQUEUE:
    return state.update(action.timeline, initialTimeline, map => map.withMutations(mMap => {
      mMap.set('queuedItems', ImmutableList())
      mMap.set('totalQueuedItemsCount', 0)
    }));
  case TIMELINE_DELETE:
    return deleteStatus(state, action.id, action.accountId, action.references, action.reblogOf);
  case TIMELINE_CLEAR:
    return clearTimeline(state, action.timeline);
  case ACCOUNT_BLOCK_SUCCESS:
  case ACCOUNT_MUTE_SUCCESS:
    return filterTimelines(state, action.relationship, action.statuses);
  case ACCOUNT_UNFOLLOW_SUCCESS:
    return filterTimeline('home', state, action.relationship, action.statuses);
  case TIMELINE_CONNECT:
    return state.update(action.timeline, initialTimeline, map => map.set('online', true));
  case TIMELINE_SCROLL_TOP:
    return updateTop(state, action.timeline, action.top);
  case TIMELINE_DISCONNECT:
    return state.update(
      action.timeline,
      initialTimeline,
      map => map.set('online', false).update('items', items => items.first() ? items.unshift(null) : items)
    )
  case UNPIN_SUCCESS:
    return removeStatusFromAccountPins(state, action.accountId, action.status.get('id'))
  case GROUP_REMOVE_STATUS_SUCCESS:
    return removeStatusFromGroup(state, action.groupId, action.statusId)
  case GROUP_UNPIN_STATUS_SUCCESS:
    return removeStatusFromGroupPins(state, action.groupId, action.statusId)

  case HOME_TIMELINE_SORT:
    return state.update('home', initialTimeline, map => map.withMutations(mMap => {
      mMap.set('sortByValue', action.sortByValue)
    }))
  default:
    return state
  }
}
