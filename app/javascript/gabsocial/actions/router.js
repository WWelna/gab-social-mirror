export const ROUTER_CHANGE = 'ROUTER_CHANGE'

/**
 * Send a message when react-router-dom changes.
 * @param {object} details like URL, params, query
 * @returns {object}
 */
export const routerChange = details => ({
  type: ROUTER_CHANGE,
  details
})
