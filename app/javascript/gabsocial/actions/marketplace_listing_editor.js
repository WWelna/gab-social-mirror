import api from '../api'
import resizeImage from '../utils/resize_image'
import { me } from '../initial_state'

export const MARKETPLACE_LISTING_CREATE_REQUEST = 'MARKETPLACE_LISTING_CREATE_REQUEST'
export const MARKETPLACE_LISTING_CREATE_SUCCESS = 'MARKETPLACE_LISTING_CREATE_SUCCESS'
export const MARKETPLACE_LISTING_CREATE_FAIL = 'MARKETPLACE_LISTING_CREATE_FAIL'

export const MARKETPLACE_LISTING_UPDATE_REQUEST = 'MARKETPLACE_LISTING_UPDATE_REQUEST'
export const MARKETPLACE_LISTING_UPDATE_SUCCESS = 'MARKETPLACE_LISTING_UPDATE_SUCCESS'
export const MARKETPLACE_LISTING_UPDATE_FAIL = 'MARKETPLACE_LISTING_UPDATE_FAIL'

export const MARKETPLACE_LISTING_UPLOAD_REQUEST  = 'MARKETPLACE_LISTING_UPLOAD_REQUEST'
export const MARKETPLACE_LISTING_UPLOAD_PROGRESS = 'MARKETPLACE_LISTING_UPLOAD_PROGRESS'
export const MARKETPLACE_LISTING_UPLOAD_SUCCESS  = 'MARKETPLACE_LISTING_UPLOAD_SUCCESS'
export const MARKETPLACE_LISTING_UPLOAD_FAIL 		 = 'MARKETPLACE_LISTING_UPLOAD_FAIL'
export const MARKETPLACE_LISTING_UPLOAD_UNDO     = 'MARKETPLACE_LISTING_UPLOAD_UNDO'

export const MARKETPLACE_LISTING_EDITOR_TITLE_CHANGE = 'MARKETPLACE_LISTING_EDITOR_TITLE_CHANGE'
export const MARKETPLACE_LISTING_EDITOR_DESCRIPTION_CHANGE = 'MARKETPLACE_LISTING_EDITOR_DESCRIPTION_CHANGE'
export const MARKETPLACE_LISTING_EDITOR_TAGS_CHANGE = 'MARKETPLACE_LISTING_EDITOR_TAGS_CHANGE'
export const MARKETPLACE_LISTING_EDITOR_CATEGORY_CHANGE = 'MARKETPLACE_LISTING_EDITOR_CATEGORY_CHANGE'
export const MARKETPLACE_LISTING_EDITOR_CONDITION_CHANGE = 'MARKETPLACE_LISTING_EDITOR_CONDITION_CHANGE'
export const MARKETPLACE_LISTING_EDITOR_LOCATION_CHANGE = 'MARKETPLACE_LISTING_EDITOR_LOCATION_CHANGE'
export const MARKETPLACE_LISTING_EDITOR_PRICE_CHANGE = 'MARKETPLACE_LISTING_EDITOR_PRICE_CHANGE'
export const MARKETPLACE_LISTING_EDITOR_SHIPPING_CHANGE = 'MARKETPLACE_LISTING_EDITOR_SHIPPING_CHANGE'

export const MARKETPLACE_LISTING_EDITOR_RESET = 'MARKETPLACE_LISTING_EDITOR_RESET'
export const MARKETPLACE_LISTING_EDITOR_SETUP = 'MARKETPLACE_LISTING_EDITOR_SETUP'

export const submit = (router, id) => (dispatch, getState) => {
	if (!me) return

	const title = getState().getIn(['marketplace_listing_editor', 'title'])
	const location = getState().getIn(['marketplace_listing_editor', 'location'])
	const price = getState().getIn(['marketplace_listing_editor', 'price'])
	const description = getState().getIn(['marketplace_listing_editor', 'description'])
	const image = getState().getIn(['marketplace_listing_editor', 'coverImage'])
	const categoryId = getState().getIn(['marketplace_listing_editor', 'category'])
	const condition = getState().getIn(['marketplace_listing_editor', 'condition'])
	const media = getState().getIn(['marketplace_listing_editor', 'media_attachments'])
	const shippingRequired = getState().getIn(['marketplace_listing_editor', 'shipping_required'])
	const mediaIds = media.map(item => item.get('id'))
	
	let tags = getState().getIn(['marketplace_listing_editor', 'tags'], '')
	if (!!tags) tags = `${tags}`.split(',').map((t) => t.trim())
	
	const options = {
		title,
		description,
		image,
		tags,
		marketplace_listing_category_id: categoryId,
		condition,
    location,
    price,
		media_ids: mediaIds,
		is_shipping_required: shippingRequired,
	}

	if (!id) {
		dispatch(createMarketplaceListing(options, router))
	} else {
		dispatch(updateMarketplaceListing(id, options, router))
	}
}


/**
 * 
 */
const createMarketplaceListing = (options, router) => (dispatch, getState) => {
	if (!me) return

	dispatch(createMarketplaceListingRequest())


	api(getState).post('/api/v1/marketplace_listings', options).then(({ data }) => {
		dispatch(createMarketplaceListingSuccess(data))	
		if (router) router.push(`/marketplace/item/${data.id}`)
	}).catch((err) => {
		dispatch(createMarketplaceListingFail(err))
	})
}

const createMarketplaceListingRequest = (id) => ({
	type: MARKETPLACE_LISTING_CREATE_REQUEST,
	id,
})

const createMarketplaceListingSuccess = (item) => ({
	type: MARKETPLACE_LISTING_CREATE_SUCCESS,
	showToast: true,
	item,
})

const createMarketplaceListingFail = (error) => ({
	type: MARKETPLACE_LISTING_CREATE_FAIL,
	showToast: true,
	error,
})

/**
 * 
 */
const updateMarketplaceListing = (id, options, router) => (dispatch, getState) => {
	if (!me) return

	dispatch(updateMarketplaceListingRequest())

  options

	api(getState).put(`/api/v1/marketplace_listings/${id}`, options).then(({ data }) => {
		dispatch(updateMarketplaceListingSuccess(data))
		router.push(`/marketplace/item/${id}`)
	}).catch((err) => dispatch(updateMarketplaceListingFail(err)))
}

const updateMarketplaceListingRequest = () => ({
	type: MARKETPLACE_LISTING_UPDATE_REQUEST,
})

const updateMarketplaceListingSuccess = (data) => ({
	type: MARKETPLACE_LISTING_UPDATE_SUCCESS,
	showToast: true,
	data,
})

const updateMarketplaceListingFail = (error) => ({
	type: MARKETPLACE_LISTING_UPDATE_FAIL,
	showToast: true,
	error,
})

/**
 * 
 */
export const uploadMarketplaceListingMedia = (files) => (dispatch, getState) => {
  if (!me) return

  const uploadLimit = 8
  const media  = getState().getIn(['marketplace_listing_editor', 'media_attachments'])
  const pending  = getState().getIn(['marketplace_listing_editor', 'pending_media_attachments'])
  const progress = new Array(files.length).fill(0)
  let total = Array.from(files).reduce((a, v) => a + v.size, 0)

  if (files.length + media.size + pending > uploadLimit) {
    // dispatch(showAlert(undefined, messages.uploadErrorLimit))
    return
  }

  dispatch(uploadMarketplaceListingMediaRequest())

	try {
		for (const [i, f] of Array.from(files).entries()) {
			if (media.size + i > uploadLimit) break
	
			resizeImage(f).then((file) => {
				const data = new FormData()
				data.append('file', file)
				// Account for disparity in size of original image and resized data
				total += file.size - f.size
	
				return api(getState).post('/api/v1/media', data, {
					onUploadProgress: ({ loaded }) => {
						progress[i] = loaded
						dispatch(uploadMarketplaceListingMediaProgress(progress.reduce((a, v) => a + v, 0), total))
					},
				}).then(({ data }) => dispatch(uploadMarketplaceListingMediaSuccess(data)))
			}).catch((error) => {
				dispatch(uploadMarketplaceListingMediaFail(error, true))
			})
		}	
	} catch (err) {
		console.log("err:", err)
	}
}

const uploadMarketplaceListingMediaRequest = () => ({
  type: MARKETPLACE_LISTING_UPLOAD_REQUEST,
})

const uploadMarketplaceListingMediaProgress = (loaded, total) => ({
  type: MARKETPLACE_LISTING_UPLOAD_PROGRESS,
  loaded: loaded,
  total: total,
})

const uploadMarketplaceListingMediaSuccess = (media) => ({
  type: MARKETPLACE_LISTING_UPLOAD_SUCCESS,
  media: media,
})

const uploadMarketplaceListingMediaFail = (error) => ({
  type: MARKETPLACE_LISTING_UPLOAD_FAIL,
  showToast: true,
  error,
})


/**
 * delete from editor, wait until user clicks "SAVE" to actually delete!
 */
 export const deleteMarketplaceListingMedia = (media_id) => ({
  type: MARKETPLACE_LISTING_UPLOAD_UNDO,
  media_id,
})

/**
 * 
 */
export const resetEditor = () => ({
	type: MARKETPLACE_LISTING_EDITOR_RESET
})

export const setMarketplaceListing = (item) => ({
	type: MARKETPLACE_LISTING_EDITOR_SETUP,
	item,
})

export const changeMarketplaceListingTitle = (title) => ({
	type: MARKETPLACE_LISTING_EDITOR_TITLE_CHANGE,
	title,
})

export const changeMarketplaceListingDescription = (description) => ({
	type: MARKETPLACE_LISTING_EDITOR_DESCRIPTION_CHANGE,
	description,
})

export const changeMarketplaceListingTags = (tags) => ({
	type: MARKETPLACE_LISTING_EDITOR_TAGS_CHANGE,
	tags,
})

export const changeMarketplaceListingCategory = (category) => ({
	type: MARKETPLACE_LISTING_EDITOR_CATEGORY_CHANGE,
	category,
})

export const changeMarketplaceListingCondition = (condition) => ({
	type: MARKETPLACE_LISTING_EDITOR_CONDITION_CHANGE,
	condition,
})

export const changeMarketplaceListingLocation = (location) => ({
	type: MARKETPLACE_LISTING_EDITOR_LOCATION_CHANGE,
	location,
})

export const changeMarketplaceListingPrice = (price) => ({
	type: MARKETPLACE_LISTING_EDITOR_PRICE_CHANGE,
	price,
})

export const changeMarketplaceListingShipping = (value) => ({
	type: MARKETPLACE_LISTING_EDITOR_SHIPPING_CHANGE,
	value,
})
