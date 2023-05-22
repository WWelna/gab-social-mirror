import queryString from 'query-string'

/**
 * Extract the group id from the route or querystring. The component requires
 * being wrapped with withRouter.
 * @method getGroupIdFromRoute
 * @param {object} vm the component's `this`
 * @returns {string?}
 */
export function getGroupIdFromRoute(vm) {
  const { params } = vm.props.match
  const { pathname, search } = vm.props.location
  const query = queryString.parse(search)
  let id = null
  if (
    pathname.startsWith('/groups') &&
    typeof params.id === 'string' &&
    params.id.length > 0
  ) {
    id = params.id
  } else if (typeof query.groupId === 'string' && query.groupId.length > 0) {
    id = query.groupId
  }
  return id
}
