export const ADVERTISEMENT_PAGE_POSITION = 'ADVERTISEMENT_PAGE_POSITION'
export const ADVERTISEMENT_REMOVE_PAGE_POSITION = 'ADVERTISEMENT_REMOVE_PAGE_POSITION'

/**
 * Store which ad is at what position on a page thus preventing randomizing ads
 * each render.
 * @param {string} options.pageKey unique key per page
 * @param {number} options.position such as index
 * @param {object} options.ad
 * @returns {object}
 */
export const pagePosition = ({ pageKey, position, ad }) => ({
  type: ADVERTISEMENT_PAGE_POSITION,
  pageKey,
  position,
  ad
})

export const removePagePosition = pagePositionKey =>
  ({ type: ADVERTISEMENT_REMOVE_PAGE_POSITION, pagePositionKey })
