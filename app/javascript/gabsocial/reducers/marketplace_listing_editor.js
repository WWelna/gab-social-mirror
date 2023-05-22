import {
  fromJS,
  Map as ImmutableMap,
  List as ImmutableList,
} from 'immutable'
import {
  MARKETPLACE_LISTING_CREATE_REQUEST,
  MARKETPLACE_LISTING_CREATE_FAIL,
  MARKETPLACE_LISTING_CREATE_SUCCESS,
  MARKETPLACE_LISTING_UPDATE_REQUEST,
  MARKETPLACE_LISTING_UPDATE_FAIL,
  MARKETPLACE_LISTING_UPDATE_SUCCESS,
  MARKETPLACE_LISTING_EDITOR_RESET,
  MARKETPLACE_LISTING_EDITOR_SETUP,
  MARKETPLACE_LISTING_EDITOR_TITLE_CHANGE,
  MARKETPLACE_LISTING_EDITOR_DESCRIPTION_CHANGE,
  MARKETPLACE_LISTING_EDITOR_TAGS_CHANGE,
  MARKETPLACE_LISTING_EDITOR_CATEGORY_CHANGE,
  MARKETPLACE_LISTING_EDITOR_CONDITION_CHANGE,
  MARKETPLACE_LISTING_EDITOR_LOCATION_CHANGE,
  MARKETPLACE_LISTING_EDITOR_PRICE_CHANGE,
  MARKETPLACE_LISTING_UPLOAD_REQUEST,
  MARKETPLACE_LISTING_UPLOAD_PROGRESS,
  MARKETPLACE_LISTING_UPLOAD_SUCCESS,
  MARKETPLACE_LISTING_UPLOAD_FAIL,
  MARKETPLACE_LISTING_UPLOAD_UNDO,
  MARKETPLACE_LISTING_EDITOR_SHIPPING_CHANGE,
} from '../actions/marketplace_listing_editor'

const initialState = ImmutableMap({
  isSubmitting: false,
  isChanged: false,
  title: '',
  description: '',
  id: '',
  tags: '',
  category: '',
  condition: '',
  shipping_required: false,
  upload_progress: 0,
  is_uploading: false,
  pending_media_attachments: 0,
  media_attachments: ImmutableList(),
})

const appendMedia = (state, media) => {
  return state.withMutations(map => {
    map.update('media_attachments', list => list.push(media));
    map.set('is_uploading', false);
    map.update('pending_media_attachments', n => n - 1)
  });
};

const removeMedia = (state, mediaId) => {
  return state.withMutations(map => {
    map.update('media_attachments', list => list.filterNot(item => item.get('id') === mediaId));
  });
};

export default function marketplaceListingEditorReducer(state = initialState, action) {
  switch(action.type) {
  case MARKETPLACE_LISTING_EDITOR_RESET:
    return initialState
  case MARKETPLACE_LISTING_EDITOR_SETUP:
    let tags
    try {
      tags = action.item.get('tags').toJS().join(', ')
    } catch (error) {
      // 
    }

    return state.withMutations((map) => {
      map.set('title', action.item.get('title'))
      map.set('description', action.item.get('description'))
      map.set('location', action.item.get('location'))
      map.set('price', action.item.get('price'))
      map.set('tags', tags)
      map.set('condition', action.item.get('condition'))
      map.set('category', action.item.getIn(['marketplace_listing_category', 'id']))
      map.set('shipping_required', !!action.item.get('is_shipping_required'))
      map.set('media_attachments', action.item.get('media_attachments'));
      map.set('isSubmitting', false)
    })
  case MARKETPLACE_LISTING_EDITOR_TITLE_CHANGE:
    return state.withMutations((map) => {
      map.set('title', action.title)
      map.set('isChanged', true)
    })
  case MARKETPLACE_LISTING_EDITOR_DESCRIPTION_CHANGE:
    return state.withMutations((map) => {
      map.set('description', action.description)
      map.set('isChanged', true)
    })
  case MARKETPLACE_LISTING_EDITOR_TAGS_CHANGE:
    return state.withMutations((map) => {
      map.set('tags', action.tags)
      map.set('isChanged', true)
    })
  case MARKETPLACE_LISTING_EDITOR_CATEGORY_CHANGE:
    return state.withMutations((map) => {
      map.set('category', action.category)
      map.set('isChanged', true)
    })
  case MARKETPLACE_LISTING_EDITOR_CONDITION_CHANGE:
    return state.withMutations((map) => {
      map.set('condition', action.condition)
      map.set('isChanged', true)
    })
  case MARKETPLACE_LISTING_EDITOR_LOCATION_CHANGE:
    return state.withMutations((map) => {
      map.set('location', action.location)
      map.set('isChanged', true)
    })
  case MARKETPLACE_LISTING_EDITOR_PRICE_CHANGE:
    return state.withMutations((map) => {
      map.set('price', action.price)
      map.set('isChanged', true)
    })
  case MARKETPLACE_LISTING_EDITOR_SHIPPING_CHANGE:
    return state.withMutations((map) => {
      map.set('shipping_required', action.value)
      map.set('isChanged', true)
    })
  
  case MARKETPLACE_LISTING_CREATE_REQUEST:
  case MARKETPLACE_LISTING_UPDATE_REQUEST:
    return state.withMutations((map) => {
      map.set('isSubmitting', true)
      map.set('isChanged', false)
    })
  case MARKETPLACE_LISTING_CREATE_FAIL:
  case MARKETPLACE_LISTING_UPDATE_FAIL:
    return state.set('isSubmitting', false)
  case MARKETPLACE_LISTING_CREATE_SUCCESS:
  case MARKETPLACE_LISTING_UPDATE_SUCCESS:
    return state.withMutations((map) => {
      map.set('isSubmitting', false)
    })

  case MARKETPLACE_LISTING_UPLOAD_REQUEST:
    return state.set('is_uploading', true).update('pending_media_attachments', n => n + 1)
  case MARKETPLACE_LISTING_UPLOAD_SUCCESS:
    state = state.set('progress', 0)
    return appendMedia(state, fromJS(action.media));
  case MARKETPLACE_LISTING_UPLOAD_FAIL:
    return state.set('is_uploading', false).update('pending_media_attachments', n => action.decrement ? n - 1 : n);
  case MARKETPLACE_LISTING_UPLOAD_UNDO:
    return removeMedia(state, action.media_id);
  case MARKETPLACE_LISTING_UPLOAD_PROGRESS:
    return state.set('progress', Math.round((action.loaded / action.total) * 100));

  default:
    return state
  }
}
