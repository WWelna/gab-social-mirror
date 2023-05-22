import { createSelector } from 'reselect'
import {
  List as ImmutableList,
  Map as ImmutableMap,
} from 'immutable'
import { me } from '../initial_state'

const getAccountBase = (state, id) => state.getIn(['accounts', id], null)
const getAccountCounters = (state, id) => state.getIn(['accounts_counters', id], null)
const getAccountRelationship = (state, id) => state.getIn(['relationships', id], null)
const getAccountMoved = (state, id) => state.getIn(['accounts', state.getIn(['accounts', id, 'moved'])])

export const makeGetAccount = () => {
  return createSelector([getAccountBase, getAccountCounters, getAccountRelationship, getAccountMoved], (base, counters, relationship, moved) => {
    if (base === null) {
      return null
    }

    return base.merge(counters).withMutations(map => {
      map.set('relationship', relationship)
      map.set('moved', moved)
    });
  });
};

export const makeGetChatMessage = () => {
  return createSelector(
    [
      (state) => state,
      (state, { id }) => state.getIn(['chat_messages', id]),
      (state, { id }) => state.getIn(['accounts', `${state.getIn(['chat_messages', `${id}`, 'from_account_id'])}`]),
      (state) => getFilters(state, { contextType: 'chats' }),
    ],
    (state, base, account, filters) => {
      if (!base) return null

      const regex = !!account && account.get('id') !== me && regexFromFilters(filters)
      const filtered = regex && regex.test(base.get('text'))

      return base.withMutations((map) => {
        map.set('account', account)
        map.set('filtered', filtered)
      })
    }
  )
}

export const makeGetChatConversation = () => {
  return createSelector(
    [
      (state) => state,
      (state, { id }) => state.getIn(['chat_conversations', `${id}`]),
      (state, { id }) => makeGetChatMessage()(state, { id: `${state.getIn(['chat_conversations', `${id}`, 'last_chat_message', 'id'])}` }),
      (state) => state.get('accounts'),
    ],
    (state, base, chatMessage, allAccounts) => {
      if (!base) return null

      let otherAccounts = ImmutableList()
      if (allAccounts) {
        base.get('other_account_ids').forEach((acctId) => {
          const acct = allAccounts.get(`${acctId}`, null)
          if (acct) {
            otherAccounts = otherAccounts.set(otherAccounts.size, acct)
          }
        })
      }

      return base.withMutations((map) => {
        map.set('other_accounts', otherAccounts)
        map.set('last_chat_message', chatMessage)
      })
    }
  )
}

const toServerSideType = (columnType) => {
  switch (columnType) {
    case 'home':
    case 'notifications':
    case 'public':
    case 'chats':
      return columnType
    case 'comments':
    case 'thread':
      return 'comments'
    default:
      if (columnType.indexOf('list:') > -1) {
        return 'home'
      } else {
        return 'public' // community, account, hashtag
      }
  }
};

export const getFilters = (state, { contextType }) => {
  return state.get('filters', ImmutableList()).filter((filter) => {
    return !contextType || (contextType && 
            filter.get('context').includes(toServerSideType(contextType)) &&
            (filter.get('expires_at') === null || Date.parse(filter.get('expires_at')) > (new Date())))
  })
}
// export const getFilters = (state) => state.get('filters')

const escapeRegExp = string =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

export const regexFromFilters = (filters) => {
  if (filters.size === 0) {
    return null;
  }

  return new RegExp(filters.map(filter => {
    let expr = escapeRegExp(filter.get('phrase'));

    if (filter.get('whole_word')) {
      if (/^[\w]/.test(expr)) {
        expr = `\\b${expr}`;
      }

      if (/[\w]$/.test(expr)) {
        expr = `${expr}\\b`;
      }
    }

    return expr;
  }).join('|'), 'i');
};

export const makeGetStatus = () => {
  return createSelector(
    [
      (state) => state,
      (state, { id }) => state.getIn(['statuses', id]),
      (state, { id }) => state.getIn(['groups', state.getIn(['statuses', id, 'group'])]),
      (state, { id }) => {
        const quoteId = state.getIn(['statuses', id, 'quote_of_id'])
        return !!quoteId ? makeGetStatus()(state, { id: quoteId }) : null
      },
      (state, { id }) => {
        const repostId = state.getIn(['statuses', id, 'reblog'])
        return !!repostId ? makeGetStatus()(state, { id: repostId }) : null
      },
      (state, { id }) => state.getIn(['accounts', state.getIn(['statuses', id, 'account'])]),
      (state, { username }) => username,
      (state, { id }) => state.getIn(['reactions', 'all', `${state.getIn(['statuses', id, 'reaction'])}`]),
      getFilters,
    ],
    (state, statusBase, group, quotedStatus, statusRepost, accountBase, username, reaction, filters) => {
      // Can't do anything without a status or account..
      if (!statusBase || !accountBase) {
        return null
      }

      const accountUsername = accountBase.get('acct');
      //Must be owner of status if username exists
      if (accountUsername !== username && username !== undefined) {
        return null
      }

      //Find ancestor status
      const accountRepost = !!statusRepost ? statusRepost.get('account') : null
      const regex = (accountRepost || accountBase).get('id') !== me && regexFromFilters(filters);
      const filtered = regex && regex.test(statusBase.get('reblog') ? statusRepost.get('search_index') : statusBase.get('search_index'));

      return statusBase.withMutations((map) => {
        map.set('quoted_status', quotedStatus);
        map.set('reblog', statusRepost);
        map.set('account', accountBase);
        map.set('reaction', reaction);
        map.set('filtered', filtered);
        map.set('group', group);
      });
    }
  );
};

export const makeGetNotification = () => {
  return createSelector([
    (_, base) => base,
    (state, _, accountId) => state.getIn(['accounts', accountId]),
  ], (base, account) => {
    return base.set('account', account);
  });
};

export const getAccountGallery = createSelector([
  (state, id) => state.getIn(['timelines', `account:${id}:media`, 'items'], ImmutableList()),
  state => state.get('statuses'),
  (state, id, mediaType) => mediaType,
], (statusIds, statuses, mediaType) => {
  let medias = ImmutableList()
  statusIds.forEach((statusId) => {
    const status = statuses.get(statusId)
    medias = medias.concat(
      status.get('media_attachments')
        .filter((media) => {
          if (mediaType === 'video') {
            return media.get('type') === 'video'
          }
          return media.get('type') !== 'video'
        })
        .map(media => media.set('status', status))
    )
  })
  return medias
})

export const getOrderedLists = createSelector([
  (state, tab) => state.getIn(['lists_lists', tab, 'items'], ImmutableList()),
  (state) => state.getIn(['lists', 'items']),
], (listIdsByTab, allLists) => {
  let returner = ImmutableList()
  listIdsByTab.forEach((id, i) => {
    const list = allLists.get(`${id}`)
    returner = returner.set(i, list)
  })
  return returner
})

export const getToasts = createSelector([
  (state) => state.get('toasts'),
], (base) => {
  if (!base) return null

  const arr = []

  base.forEach((item) => {
    arr.push({
      message: item.get('message'),
      type: item.get('type'),
      key: item.get('key'),
    })
  })

  return arr
})

export const getListOfGroups = createSelector([
  (state) => state.get('groups'),
  (state, { type }) => state.getIn(['group_lists', type, 'items']),
], (groups, groupIds) => {
  let list = ImmutableList()
  groupIds.forEach((id, i) => {
    const group = groups.get(`${id}`)
    list = list.set(i, group)
  })

  return list
})
  
export const getGroupStatusContexts = createSelector([
  (state) => state.getIn(['status_contexts', 'objects'], ImmutableMap()),
  (state, { groupId }) => groupId,
  (state, { isEnabled }) => isEnabled,
], (statusContextObjects, groupId, isEnabled) => {
  const stausContexts = statusContextObjects.toList()
  return stausContexts.filter((obj) => {
    return obj.get('is_enabled') == isEnabled && obj.get('group_id') == groupId
  })
})

export const getGlobalStatusContexts = createSelector([
  (state) => state.getIn(['status_contexts', 'objects'], ImmutableMap()),
  (state, { isEnabled }) => isEnabled,
], (statusContextObjects, isEnabled) => {
  const stausContexts = statusContextObjects.toList()
  return stausContexts.filter((obj) => {
    return obj.get('is_enabled') == isEnabled && !!obj.get('is_global')
  })
})