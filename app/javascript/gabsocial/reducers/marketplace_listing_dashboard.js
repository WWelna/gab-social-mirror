import {
  MARKETPLACE_LISTING_DASHBOARD_CHANGE_QUERY,
  MARKETPLACE_LISTING_DASHBOARD_CHANGE_STATUS,
} from '../actions/marketplace_listing_dashboard'
import {
  fromJS,
  Map as ImmutableMap,
  List as ImmutableList,
} from 'immutable'

const initialState = ImmutableMap({
  changed: false,
  search: '',
  active_search_statuses: ImmutableList(),
})

export default function marketplace_listing_dashboard(state = initialState, action) {
  switch(action.type) {
    case MARKETPLACE_LISTING_DASHBOARD_CHANGE_QUERY:
      return state.set('search', action.value)
    case MARKETPLACE_LISTING_DASHBOARD_CHANGE_STATUS:
      if (action.status === null) {
        // reset to "ALL"
        return state.set('active_search_statuses', ImmutableList())
      }
     
      if (action.addOrRemove) {
        let newGroupIds = state.get('active_search_statuses').toJS()
        newGroupIds.push(action.status)
        newGroupIds = Array.from(new Set(newGroupIds)) //unique
        return state.set('active_search_statuses', fromJS(newGroupIds))
      } else {
        state = state.update('active_search_statuses', (list) => {
          return list.filterNot((id) => {
            return id === action.status
          })
        })
        // if null, set to empty list
        if (!state.get('active_search_statuses')) {
          return state.set('active_search_statuses', ImmutableList())
        }
        return state
      }
    default:
      return state
  }
}
