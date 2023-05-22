import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import isObject from 'lodash/isObject'
import {
  changeMarketplaceListingTitle,
  changeMarketplaceListingDescription,
  changeMarketplaceListingTags,
  changeMarketplaceListingLocation,
  changeMarketplaceListingPrice,
  changeMarketplaceListingCategory,
	changeMarketplaceListingCondition,
	changeMarketplaceListingShipping,
  submit,
  setMarketplaceListing,
  resetEditor,
} from '../actions/marketplace_listing_editor'
import { openModal, closeModal } from '../actions/modal'
import { fetchMarketplaceListingById } from '../actions/marketplace_listings'
import { fetchMarketplaceListingCategories } from '../actions/marketplace_listing_categories'
import {
	MODAL_CONFIRM,
	MARKETPLACE_LISTING_CONDITIONS,
} from '../constants'
import { me } from '../initial_state'
import ResponsiveClassesComponent from './ui/util/responsive_classes_component'
import ColumnIndicator from '../components/column_indicator'
import Button from '../components/button'
import Divider from '../components/divider'
import Input from '../components/input'
import Text from '../components/text'
import Select from '../components/select'
import Textarea from '../components/textarea'
import Block from '../components/block'
import Switch from '../components/switch'
import MarketplaceListingMediaUploadBlock from '../components/marketplace/marketplace_listing_media_upload_block'

const conditionsOptions = [{'title':'',value:''}]
for (const key in MARKETPLACE_LISTING_CONDITIONS) {
	// no "All"
	if (key != 0) {
		conditionsOptions.push(MARKETPLACE_LISTING_CONDITIONS[key])
	}
}

class MarketplaceListingCreate extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
  }

  componentDidMount() {
		const { itemId, item, categories } = this.props

		if (!categories || categories.size === 0) {
			this.props.onFetchMarketplaceListingCategories()
		}

		this.props.onResetEditor()

    if (!item && !!itemId) {
      this.props.onFetchMarketplaceListing(itemId)
    } else if (itemId) {
      this.props.onSetMarketplaceListing(item)
    }
  }
  
  componentWillReceiveProps(nextProps) {
	  if (this.props.item !== nextProps.item && !!nextProps.item) {
	    this.props.onSetMarketplaceListing(nextProps.item)
	  }
  }

	handleOnSubmit = (e) => {
		const { onSubmit, onClose, idValue } = this.props
		
		e.preventDefault()

		!!onClose && onClose()

		onSubmit(this.props.history, idValue)
	}

	render() {
	  const {
	    item,
	    titleValue,
	    priceValue,
	    descriptionValue,
	    locationValue,
	    onChangeTitle,
	    onChangeLocation,
	    onChangePrice,
	    onChangeCategory,
			onChangeCondition,
	    onDescriptionChange,
			onChangeShipping,
	    onChangeTags,
	    isSubmitting,
	    tags,
	    category,
	    itemId,
	    categories,
			condition,
			shipping,
			isOwner,
			isError,
	  } = this.props

		if (isError || (!isOwner && itemId)) {
			return <ColumnIndicator type='error' />
		} else if (!item && itemId) {
	    return <ColumnIndicator type='loading' />
	  }

	  const categoriesOptions = [{'title':'',value:''}]
	  if (categories) {
	    for (let i = 0; i < categories.count(); i++) {
	      const c = categories.get(i)
	      categoriesOptions.push({
	        title: c.get('name'),
	        value: c.get('id'),
	      })
	    }
	  }

	  const submitDisabled = ((!titleValue || !category || !descriptionValue) && !itemId) || isSubmitting

	  return (
			<div className={[_s.d, _s.w100PC].join(' ')}>
				<Block>
					<ResponsiveClassesComponent
						classNames={[_s.d, _s.w100PC, _s.px15, _s.py15, _s.flexRow, _s.flexWrap].join(' ')}
						classNamesXS={[_s.d, _s.w100PC, _s.px15, _s.py15, _s.flexColumnReverse].join(' ')}
					>
						<div className={[_s.d, _s.flexGrow1].join(' ')}>
							<ResponsiveClassesComponent
								classNames={[_s.d, _s.flexRow].join(' ')}
								classNamesSmall={[_s.d, _s.flexColumnReverse].join(' ')}
							>
								<ResponsiveClassesComponent
									classNames={[_s.d, _s.flex1, _s.alignSelfStart].join(' ')}
									classNamesSmall={[_s.d, _s.flex1, _s.mt5].join(' ')}
								>
									<Input
										id='marketplace-listing-title'
										title='Title *'
										maxLength={120}
										value={titleValue}
										onChange={onChangeTitle}
										isDisabled={isSubmitting}
										placeholder='Marketplace item title...'
										isRequired
									/>

									<Divider isInvisible />

									<Textarea
										title='Description *'
										value={descriptionValue}
										onChange={onDescriptionChange}
										placeholder='This marketplace item is about...'
										isDisabled={isSubmitting}
										maxLength={3000}
										isRequired
									/>
								</ResponsiveClassesComponent>

								<ResponsiveClassesComponent
									classNames={[_s.d, _s.ml15, _s.w645PX].join(' ')}
									classNamesLarge={[_s.d, _s.ml15, _s.w48PC].join(' ')}
									classNamesMedium={[_s.d, _s.ml15, _s.w50PC].join(' ')}
									classNamesSmall={[_s.d, _s.mb15].join(' ')}
									classNamesXS={[_s.d, _s.mb15].join(' ')}
								>
									<MarketplaceListingMediaUploadBlock isDisabled={isSubmitting} isEditing={itemId} />
								</ResponsiveClassesComponent>
							</ResponsiveClassesComponent>

							<Divider isInvisible />
							
							<div className={[_s.d, _s.flexRow, _s.flexWrap].join(' ')}>
								<div className={[_s.d, _s.flex1, _s.maxW320PX, _s.pr15].join(' ')}>
									<Input
										inputType='number'
										id='marketplace-listing-price'
										title='Price (USD) *'
										placeholder='0.00'
										type='number'
										maxLength={8}
										value={priceValue}
										onChange={onChangePrice}
										isDisabled={isSubmitting}
									/>
								</div>
								<div className={[_s.d, _s.aiStart].join(' ')}>
									<Text className={[_s.mt5, _s.pl15, _s.mb15, _s.pb5].join(' ')} size='small' weight='medium' color='secondary' tagName='label'>
										Does the item require shipping?
									</Text>
									<Switch
										disabled={isSubmitting}
										onChange={onChangeShipping}
										checked={shipping}
									/>
								</div>
							</div>

							<Divider isInvisible />	

							<div className={[_s.d, _s.flexRow, _s.flexWrap, _s.mb15, _s.pb5].join(' ')}>
								<ResponsiveClassesComponent
									classNames={[_s.d, _s.flex1, _s.pr15, _s.minW198PX].join(' ')}
									classNamesXS={[_s.d, _s.mb15, _s.pb10, _s.w100PC].join(' ')}
								>
									<Text className={[_s.pl15, _s.mb10].join(' ')} size='small' weight='medium' color='secondary'>
										Category *
									</Text>
									<Select
										value={category}
										onChange={onChangeCategory}
										options={categoriesOptions}
										isDisabled={isSubmitting}
									/>
								</ResponsiveClassesComponent>

								<div className={[_s.d, _s.flex1, _s.minW198PX].join(' ')}>
									<Text className={[_s.pl15, _s.mb10].join(' ')} size='small' weight='medium' color='secondary'>
										Condition *
									</Text>
									<Select
										value={condition}
										onChange={onChangeCondition}
										options={conditionsOptions}
										isDisabled={isSubmitting}
									/>
								</div>
							</div>

							<Input
								id='marketplace-listing-tags'
								title='Tags'
								placeholder='restored, leather, etc.'
								value={tags}
								maxLength={120}
								onChange={onChangeTags}
								isDisabled={isSubmitting}
							/>
							<Text className={[_s.mt10, _s.pl15].join(' ')} size='small' color='tertiary'>
								(Optional) Add tags separated by commas to increase item visibility
							</Text>
							
							<Divider isInvisible />

							<Input
								id='marketplace-listing-location'
								title='Location'
								placeholder=''
								maxLength={120}
								value={locationValue}
								onChange={onChangeLocation}
								isDisabled={isSubmitting}
							/>
							<Text className={[_s.mt5, _s.pl15].join(' ')} size='small' color='tertiary'>
								(Optional) Add a location such as a town, city and/or state to help local buyers
							</Text>

							<Divider isInvisible />
							
							<Button
								isDisabled={submitDisabled}
								onClick={this.handleOnSubmit}
							>
								<Text color='inherit' align='center' weight='medium'>
									{!!itemId ? 'Update Marketplace Listing' : 'Create Marketplace Listing'}
								</Text>
							</Button>

						</div>
					</ResponsiveClassesComponent>
				</Block>
			</div>
	  )
	}

}

const mapStateToProps = (state, { params }) => {
  const itemId = isObject(params) ? params.id : null
  const item = state.getIn(['marketplace_listings', `${itemId}`])

	// : todo :
	// if already has item (i.e. is editing)
	// make sure current user is owner the item

	const isOwner = !!item ? item.getIn(['account', 'id']) === me : false
	if (itemId && item && !isOwner) {
		return {
			itemId,
			isError: true,
		}
	}

  return {
    item,
    itemId,
		isOwner,
    titleValue: state.getIn(['marketplace_listing_editor', 'title']),
    locationValue: state.getIn(['marketplace_listing_editor', 'location']),
    priceValue: state.getIn(['marketplace_listing_editor', 'price']),
    descriptionValue: state.getIn(['marketplace_listing_editor', 'description']),
    isSubmitting: state.getIn(['marketplace_listing_editor', 'isSubmitting']),
    idValue: itemId,
    tags: state.getIn(['marketplace_listing_editor', 'tags']),
    category: state.getIn(['marketplace_listing_editor', 'category']),
		condition: state.getIn(['marketplace_listing_editor', 'condition']),
		shipping: state.getIn(['marketplace_listing_editor', 'shipping_required']),
    categories: state.getIn(['marketplace_listing_categories', 'items']),
  }
}

const mapDispatchToProps = (dispatch) => ({
  onChangeTitle(value) {
    dispatch(changeMarketplaceListingTitle(value))
  },
  onDescriptionChange(value) {
    dispatch(changeMarketplaceListingDescription(value))
  },
  onChangeTags(value) {
    dispatch(changeMarketplaceListingTags(value))
  },
  onChangeLocation(value) {
    dispatch(changeMarketplaceListingLocation(value))
  },
  onChangeCategory(e) {
    dispatch(changeMarketplaceListingCategory(e.target.value))
  },
	onChangeCondition(e) {
    dispatch(changeMarketplaceListingCondition(e.target.value))
  },
  onChangePrice(value) {
    dispatch(changeMarketplaceListingPrice(value))
  },
	onChangeShipping(checked) {
    dispatch(changeMarketplaceListingShipping(checked))
  },
  onResetEditor() {
    dispatch(resetEditor())
  },
  onSetMarketplaceListing(item) {
    dispatch(setMarketplaceListing(item))
  },
  onSubmit(routerHistory, idValue) {
		if (idValue) {
			// if editing, show confirmation modal
			dispatch(openModal(MODAL_CONFIRM, {
				title: 'Submit Listing Update',
				message: 'After submitting an update, your listing will need to be approved by our moderation team again.',
				confirm: 'Submit',
				onConfirm: () => {
					dispatch(submit(routerHistory, idValue))
					dispatch(closeModal())
				},
			}))
		} else {
			dispatch(submit(routerHistory, idValue))
			dispatch(closeModal())
		}
  },
  onFetchMarketplaceListing(id) {
    dispatch(fetchMarketplaceListingById(id))
  },
  onFetchMarketplaceListingCategories() {
    dispatch(fetchMarketplaceListingCategories())
  },
})

MarketplaceListingCreate.propTypes = {
  titleValue: PropTypes.string,
  descriptionValue: PropTypes.string,
  onChangeTitle: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onChangeTags: PropTypes.func.isRequired,
  onChangeLocation: PropTypes.func.isRequired,
  onChangePrice: PropTypes.func.isRequired,
	onChangeShipping: PropTypes.func.isRequired,
  onFetchMarketplaceListing: PropTypes.func.isRequired,
  onFetchMarketplaceListingCategories: PropTypes.func.isRequired,
  onChangeCategory: PropTypes.func.isRequired,
	onChangeCondition: PropTypes.func.isRequired,
  onResetEditor: PropTypes.func.isRequired,
  onSetMarketplaceListing: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  onClose: PropTypes.func,
  idValue: PropTypes.string,
  tags: PropTypes.string,
  category: PropTypes.string,
	condition: PropTypes.string,
  priceValue: PropTypes.string,
  locationValue: PropTypes.string,
  categories: ImmutablePropTypes.list,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MarketplaceListingCreate))
