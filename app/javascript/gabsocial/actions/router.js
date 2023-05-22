export const ROUTER_CHANGE = 'ROUTER_CHANGE'
export const ROUTER_RESET = 'ROUTER_RESET'

/**
 * Send a message when react-router-dom changes.
 * @param {object} details like URL, params, query
 * @returns {object}
 */
export const routerChange = details => ({
  type: ROUTER_CHANGE,
  details
})


export const routerReset = () => ({ type: ROUTER_RESET })
