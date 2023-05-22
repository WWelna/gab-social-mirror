import api from '../api'

//

export const ADVERTISEMENT_DATA_BATCH_VIEWS = 'ADVERTISEMENT_DATA_BATCH_VIEWS'

export const ADVERTISEMENT_DATA_SAVE_VIEWS_REQUEST = 'ADVERTISEMENT_DATA_SAVE_VIEWS_REQUEST'
export const ADVERTISEMENT_DATA_SAVE_VIEWS_SUCCESS = 'ADVERTISEMENT_DATA_SAVE_VIEWS_SUCCESS'
export const ADVERTISEMENT_DATA_SAVE_VIEWS_FAIL = 'ADVERTISEMENT_DATA_SAVE_VIEWS_FAIL'

export const ADVERTISEMENT_DATA_SAVE_CLICK_REQUEST = 'ADVERTISEMENT_DATA_SAVE_CLICK_REQUEST'
export const ADVERTISEMENT_DATA_SAVE_CLICK_SUCCESS = 'ADVERTISEMENT_DATA_SAVE_CLICK_SUCCESS'
export const ADVERTISEMENT_DATA_SAVE_CLICK_FAIL = 'ADVERTISEMENT_DATA_SAVE_CLICK_FAIL'

export const ADVERTISEMENT_PAGE_POSITION = 'ADVERTISEMENT_PAGE_POSITION'

/**
 * Save advertisement per CLICK
 */
export const saveAdvertisementClickData = (adId, placement) => (dispatch, getState) => {
    // must have ad id
    if (!adId) return

    dispatch(saveAdvertisementClickDataRequest())

    api(getState).post(`/api/ad_click`, {
        ad_id: adId,
        placement,
    }).then(() => {
        dispatch(saveAdvertisementClickDataSuccess())
    }).catch((error) => {
        dispatch(saveAdvertisementClickDataFail(error))
    })
}

const saveAdvertisementClickDataRequest = () => ({
    type: ADVERTISEMENT_DATA_SAVE_CLICK_REQUEST,
})

const saveAdvertisementClickDataSuccess = () => ({
    type: ADVERTISEMENT_DATA_SAVE_CLICK_SUCCESS,
})

const saveAdvertisementClickDataFail = (error) => ({
    type: ADVERTISEMENT_DATA_SAVE_CLICK_FAIL,
    error,
})

/**
 * Save advertisement VIEW data
 */
export const saveAdvertisementViewData = (adId) => (dispatch, getState) => {
    // must have ad id
    if (!adId) return

    dispatch(saveAdvertisementViewDataRequest(adId))

    const adViewCount = getState().getIn(['advertisements', adId, 'view_count'])

    // dont send if no views (nan or 0)
    if (isNaN(adViewCount) || adViewCount <= 0) return

    api(getState).post(`/api/ad_view`, {
        ad_id: adId,
        views: adViewCount,
    }).then(() => {
        dispatch(saveAdvertisementViewDataSuccess(adId))
    }).catch((error) => {
        dispatch(saveAdvertisementViewDataFail(error, adId))
    })
}

const saveAdvertisementViewDataRequest = (adId) => ({
    type: ADVERTISEMENT_DATA_SAVE_VIEWS_REQUEST,
    adId,
})

const saveAdvertisementViewDataSuccess = (adId) => ({
    type: ADVERTISEMENT_DATA_SAVE_VIEWS_SUCCESS,
    adId,
})

const saveAdvertisementViewDataFail = (error, adId) => ({
    type: ADVERTISEMENT_DATA_SAVE_VIEWS_FAIL,
    error,
    adId,
})

//

/**
 * Increment view count for ad id
 */
export const incrementViewCountForAdvertisement = (adId) => (dispatch) => {
    // must have ad id
    if (!adId) return

    dispatch({
        type: ADVERTISEMENT_DATA_BATCH_VIEWS,
        adId,
    })
}

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
