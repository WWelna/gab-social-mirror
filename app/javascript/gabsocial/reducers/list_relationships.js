import {
  LIST_RELATIONSHIPS_FETCH_SUCCESS,
  LIST_ACCOUNTS_MEMBER_LEAVE_SUCCESS,
  LIST_SUBSCRIBE_SUCCESS,
  LIST_UNSUBSCRIBE_SUCCESS,
} from '../actions/lists'
import { Map as ImmutableMap, fromJS } from 'immutable'

const initialState = ImmutableMap()

const normalizeRelationship = (state, relationship) => state.set(relationship.id, fromJS(relationship))
  
const normalizeRelationships = (state, relationships) => {
  relationships.forEach(relationship => {
    state = normalizeRelationship(state, relationship)
  })
  
  return state
}
  
export default function list_relationships(state = initialState, action) {
  switch(action.type) {
  case LIST_SUBSCRIBE_SUCCESS:
    return state.setIn([action.id, 'subscriber'], true)
  case LIST_ACCOUNTS_MEMBER_LEAVE_SUCCESS:
    return state.setIn([action.id, 'member'], false)
  case LIST_UNSUBSCRIBE_SUCCESS:
    return state.setIn([action.id, 'subscriber'], false)
  case LIST_RELATIONSHIPS_FETCH_SUCCESS:
    return normalizeRelationships(state, action.relationships)
  default:
    return state
  }
}
  