import queryString from 'query-string'

/**
 * Try to parse the querystring providing defaults if nothing is there.
 * @method parseQuerystring
 * @param {object} defaults
 * @returns {object}
 */
export function parseQuerystring(defaults = {}) {
  let parsed = {}
  try {
    parsed = queryString.parse(window.location.search)
  } catch (err) {
    console.error("error parsing querystring", err)
  }
  return Object.assign({}, defaults, parsed)
}
