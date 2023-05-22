import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { NavLink, withRouter } from 'react-router-dom'
import ImmutablePureComponent from 'react-immutable-pure-component'
import isObject from 'lodash/isObject'
import moment from 'moment-mini'
import {
	openPopover,
} from '../actions/popover'
import {
	saveMarketplaceListing,
	unsaveMarketplaceListing,
	isMarketplaceListingSaved,
} from '../actions/marketplace_listing_saves'
import {
	createChatConversation,
} from '../actions/chat_conversations'
import {
	openModal,
} from '../actions/modal'
import {
	sendChatMessage,
} from '../actions/chat_messages'
import {
	CX,
	POPOVER_SHARE,
	MODAL_UNAUTHORIZED,
	MARKETPLACE_LISTING_CONDITIONS,
	POPOVER_MARKETPLACE_LISTING_OPTIONS,
} from '../constants'
import { me } from '../initial_state'
import { makeGetAccount } from '../selectors'
import { fetchMarketplaceListingById } from '../actions/marketplace_listings'
import {
	ProfileInfoPanel,
	MarketplaceListingBuyers,
	MarketplaceListingStatusChanges,
} from './ui/util/async_components'
import ResponsiveClassesComponent from './ui/util/responsive_classes_component'
import WrappedBundle from './ui/util/wrapped_bundle'
import ColumnIndicator from '../components/column_indicator'
import Block from '../components/block'
import Button from '../components/button'
import Divider from '../components/divider'
import Image from '../components/image'
import Input from '../components/input'
import Text from '../components/text'
import Avatar from '../components/avatar'
import DisplayName from '../components/display_name'
import Blurhash from '../components/blurhash'
import Carousel from '../components/carousel'

class MarketplaceListingDetail extends ImmutablePureComponent {

	static contextTypes = {
		router: PropTypes.object,
	}

	state = {
		message: 'Hi, is this item still available?',
		isSendDisabled: false,
	}

	componentDidMount() {
		const { itemId, item } = this.props

		if (!item && itemId) {
			this.props.onFetchMarketplaceItem(itemId)
		}
		if (item && item.get('saved') === undefined) {
			this.props.onIsMarketplaceListingSaved(item)
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.item !== prevProps.item && !!prevProps.item) {
			// this.props.onFetchMarketplaceItem(nextProps.itemId)
		}

		if (this.props.item && this.props.item.get('saved') === undefined) {
			this.props.onIsMarketplaceListingSaved(this.props.item)
		}
	}

	handleOnSave = () => {
		if (!me) {
			this.props.onOpenUnauthorizedModal()
			return false
		}

		const { item } = this.props
		if (item.get('saved')) {
			this.props.onUnsaveMarketplaceListing(item)
		} else {
			this.props.onSaveMarketplaceListing(item)
		}
	}

	handleOnChangeMessage = (value) => {
		this.setState({ message: value })	
	}

	handleOnSendMessage = () => {
		if (!me) {
			this.props.onOpenUnauthorizedModal()
			return false
		}

		const { owner, item, history } = this.props
		const { message } = this.state

		this.setState({ isSendDisabled: true })

		if (!!owner && !!item) {
			this.props.onSendMessage(owner.get('id'), history, item, message)
		}
	}

	handleOnOpenSharePopover = () => {
		this.props.onOpenSharePopover(this.shareBtnRef, this.props.item)
	}

	handleOnOpenMorePopover = () => {
		if (!me) {
			this.props.onOpenUnauthorizedModal()
			return false
		}
		
		this.props.onOpenMorePopover(this.moreBtnRef, this.props.item.get('id'))
	}

	setShareBtnRef = (n) => {
		this.shareBtnRef = n
	}

	setMoreBtnRef = (n) => {
		this.moreBtnRef = n
	}

	render() {
		const {
			item,
			error,
			isSubmitting,
			itemId,
			isOwner,
			owner,
		} = this.props
		const { message, isSendDisabled } = this.state

		// : todo : if blocked by owner or blocking owner

		if ((!item && itemId) || !owner) {
			return <ColumnIndicator type='loading' />
		} else if ((!item && error)) {
			return <ColumnIndicator type='missing' />
		}

		const location = item.get('location')
		const locationStr = !!location ? ` in ${location}` : ''
		const subtitle = `Listed ${moment(item.get('created_at')).fromNow()}${locationStr}`
		const status = item.get('status_s')
		const saveTitle = item.get('saved') === true ? 'Unsave' : 'Save'
		let condition = MARKETPLACE_LISTING_CONDITIONS.find((c) => c.value === item.get('condition'))
		condition = !!condition ? condition.title : null
		
		if (status !== 'Running' && !isOwner) return <ColumnIndicator type='missing' />

		const sellerBannerClasses = CX({
			d: 1,
			px15: 1,
			py15: 1,
			flexRow: 1,
			aiCenter: 1,
			bgBlackOpaquest: status !== 'Running' && status !== 'Expired' && status !== 'Rejected',
			bgDonor: status === 'Running',
			bgDanger: status === 'Expired' || status === 'Rejected',
			borderTop1PX: 1,
			borderBottom1PX: 1,
			borderColorSecondary: 1,
		})
		const bannerStatusColor = status === 'Running' ? 'white' : 'primary'
		const media = item.get('media_attachments')
		const hasMedia = !!media && media.size > 0
		const marketplaceListingActionButtonGroup = (
			<MarketplaceListingActionButtonGroup
				onSave={this.handleOnSave}
				saveTitle={saveTitle}
				shareBtnRef={this.setShareBtnRef}
				onShare={this.handleOnOpenSharePopover}
				moreBtnRef={this.setMoreBtnRef}
				onOpenMore={this.handleOnOpenMorePopover}
			/>
		)

		return (
			<div className={[_s.d, _s.w100PC].join(' ')}>
				<Block>
					<div className={[_s.d].join(' ')}>
						<div className={[_s.d, _s.w100PC].join(' ')}>
							{/*  banner for seller */}
							{
								isOwner &&
								<div className={sellerBannerClasses}>
									{/* listing status */}
									<Text color={bannerStatusColor} weight='bold' size='medium'>
										{item.get('status_s').toUpperCase()}
									</Text>
									<Button
										radiusSmall
										icon='pencil'
										iconSize='16px'
										title='Save'
										color='primary'
										backgroundColor='tertiary'
										to={`/marketplace/item/${item.get('id')}/edit`}
										className={[_s.mlAuto, _s.mr10, _s.aiCenter].join(' ')}
									>
										<Text color='inherit' weight='bold' className={[_s.ml10].join(' ')}>
											Edit
										</Text>
									</Button>
									{ marketplaceListingActionButtonGroup }
								</div>
							}

							<div className={[_s.d, _s.px15, _s.py15, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
								<Text size='extraExtraLarge' weight='bold'>
									{item.get('title')}
								</Text>
								<Text className={_s.mt5} size='medium' weight='medium'>
									{item.get('price_label')}
								</Text>
								<Text className={_s.mt5} color='secondary' size='small'>
									{subtitle}
								</Text>
							</div>
							
							{
								hasMedia &&
								<div className={[_s.d, _s.w100PC, _s.overflowHidden, _s.borderTop1PX, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
									<Carousel size={item.get('media_attachments').count()}>
										{
											item.get('media_attachments').map((media, i) => (
												<React.Fragment key={`mpl-media-${i}`}>
													<Blurhash
														className={[_s.d, _s.w100PC, _s.h100PC, _s.posAbs, _s.top0].join(' ')}
														hash={media.get('blurhash')}
													/>
													<Image
														className={[_s.d, _s.maxH520PX, _s.h100PC, _s.wAuto, _s.z2, _s.mlAuto, _s.mrAuto].join(' ')}
														width='auto'
														src={media.get('preview_url')}
													/>
												</React.Fragment>
											))
										}
									</Carousel>
								</div>
							}

							{
								!isOwner &&
								<ResponsiveClassesComponent
									classNames={[_s.d, _s.flexRow, _s.mt15, _s.px15, _s.pb5, _s.mb15].join(' ')}
									classNamesXS={[_s.d, _s.mt15, _s.px15, _s.py5].join(' ')}
								>
									<ResponsiveClassesComponent
										classNames={[_s.d, _s.flexGrow1, _s.maxW320PX].join(' ')}
										classNamesXS={[_s.d, _s.mb15, _s.w100PC].join(' ')}
									>
										<Text size='medium'>
											Send Seller a Message with Gab Chat
										</Text>
										<div className={[_s.d, _s.flexRow, _s.mt10, _s.w100PC].join(' ')}>
											<Input
												radiusSmall
												hasButtonAppended
												isDisabled={isSendDisabled}
												maxLength={300}
												onChange={this.handleOnChangeMessage}
												value={message}
											/>
											<Button
												radiusSmall
												onClick={this.handleOnSendMessage}
												isDisabled={isSendDisabled}
												className={[_s.topLeftRadius0, _s.bottomLeftRadius0, _s.aiCenter].join(' ')}
											>
												<Text color='inherit' size='medium' weight='bold'>
													Send
												</Text>
											</Button>
										</div>
									</ResponsiveClassesComponent>
									<ResponsiveClassesComponent
										classNames={[_s.d, _s.mlAuto].join(' ')}
										classNamesXS={[_s.d, _s.w100PC, _s.py10].join(' ')}
									>
										{ marketplaceListingActionButtonGroup }
									</ResponsiveClassesComponent>
								</ResponsiveClassesComponent>
							}
							
							{ !isOwner && <Divider isSmall /> }

							<ResponsiveClassesComponent
        				classNames={[_s.d, _s.flexRow, _s.w100PC, _s.py15].join(' ')}
        				classNamesXS={[_s.d, _s.w100PC, _s.pt10].join(' ')}
      				>
								<div className={[_s.d, _s.flex1, _s.overflowHidden].join(' ')}>
									<div className={[_s.d, _s.px15, _s.mb15, _s.pb5].join(' ')}>
										<Text size='large' weight='bold' className={[_s.mt5, _s.mb15].join(' ')}>
											Description	
										</Text>
										<div className={_s.dangerousContent} dangerouslySetInnerHTML={{ __html: item.get('description_html') }} />
									</div>
								</div>
								<ResponsiveClassesComponent
									classNames={[_s.d, _s.w330PX, _s.px15, _s.borderLeft1PX, _s.borderColorSecondary].join(' ')}
									classNamesSmall={[_s.d, _s.w50PC, _s.px15, _s.borderLeft1PX, _s.borderColorSecondary].join(' ')}
									classNamesXS={[_s.d, _s.w100PC, _s.px15, _s.pt15, _s.mt5, _s.borderTop1PX, _s.borderColorSecondary].join(' ')}
      					>
									<Text size='large' weight='bold' className={[_s.mt5, _s.mb15].join(' ')}>
										Details	
									</Text>
									<div className={[_s.d, _s.mt5, _s.mb10, _s.flexRow, _s.jcSpaceBetween].join(' ')}>
										<Text weight='medium'>
											Category
										</Text>
										<NavLink
											to={`/marketplace/listings?category_id=${item.getIn(['marketplace_listing_category', 'id'])}`}
											className={[_s.noUnderline, _s.underline_onHover, _s.cBrand].join(' ')}
										>
											<Text color='brand' weight='medium'>
												{item.getIn(['marketplace_listing_category', 'name'])}
											</Text>
										</NavLink>
									</div>
									<div className={[_s.d, _s.mt5, _s.mb10, _s.flexRow, _s.jcSpaceBetween].join(' ')}>
										<Text weight='medium'>
											Condition
										</Text>
										<Text>
											{condition}
										</Text>
									</div>
									{
										!!location &&
										<div className={[_s.d, _s.mt5, _s.mb10, _s.flexRow, _s.jcSpaceBetween].join(' ')}>
											<Text weight='medium'>
												Location
											</Text>
											<Text>
												{location}
											</Text>
										</div>
									}
									<div className={[_s.d, _s.mt5, _s.mb10, _s.flexRow, _s.jcSpaceBetween].join(' ')}>
										<Text weight='medium'>
											Shippable Item
										</Text>
										<Text>
											{item.get('is_shipping_required') ? 'Yes' : 'No'}
										</Text>
									</div>
									<div className={[_s.d, _s.mt5, _s.mb10, _s.flexRow, _s.jcSpaceBetween].join(' ')}>
										<Text weight='medium'>
											Saves
										</Text>
										<Text>
											{item.get('saves')}
										</Text>
									</div>
									<div className={[_s.d, _s.mt5, _s.mb10, _s.flexRow, _s.jcSpaceBetween].join(' ')}>
										<Text weight='medium'>
											Last Updated
										</Text>
										<Text>
											{moment(item.get('created_at')).format('lll')}
										</Text>
									</div>
									{
										!!item.get('tags') && item.get('tags').count() > 0 &&
										<div className={[_s.d, _s.mt5, _s.mb10].join(' ')}>
											<Text weight='medium'>
												Tags
											</Text>
											<div className={[_s.d, _s.mt10, _s.flexRow, _s.flexWrap].join(' ')}>
												{item.get('tags').map((tag) => (
													<NavLink
														key={`listing-${item.get('id')}-tag-${tag}`}
														to={`/marketplace/listings?tags=${tag}`}
														className={[_s.noUnderline, _s.pr10, _s.py2, _s.cursorPointer, _s.whiteSpaceNoWrap].join(' ')}
													>
														<Text className={[_s.bgSecondary, _s.bgSecondaryDark_onHover, _s.radiusSmall, _s.px10, _s.py2, _s.lineHeight15].join(' ')}>
															{tag}
														</Text>
													</NavLink>
												))}
											</div>
										</div>
									}
									<div className={[_s.d, _s.mt15, _s.mb10, _s.flexRow].join(' ')}>
										<Text color='secondary' size='small'>
											Listing ID:&nbsp;{item.get('id')}
										</Text>
									</div>
								</ResponsiveClassesComponent>
							</ResponsiveClassesComponent>

							<Divider isSmall />

							{
								!isOwner &&
								<div className={[_s.d, _s.px15, _s.py15, _s.mt5].join(' ')}>
									<div className={[_s.d, _s.flexRow].join(' ')}>
										<Text size='large' weight='bold' className={[_s.mt5, _s.mb5].join(' ')}>Seller Information</Text>
										<div className={[_s.d, _s.mlAuto].join(' ')}>
											<Button
												isText
												radiusSmall
												backgroundColor='none'
												color='brand'
												to={`/${owner.get('username')}`}
												className={[_s.px15, _s.py5, _s.bgSubtle_onHover].join(' ')}
											>
												<Text color='inherit' weight='bold'>
													View Seller Profile
												</Text>
											</Button>
										</div>
									</div>

									<div className={[_s.d, _s.mt10].join(' ')}>
										<div className={[_s.d, _s.flexRow].join(' ')}>
											<Avatar size={60} account={item.get('account')} />
											<div className={[_s.d, _s.ml15].join(' ')}>
												<DisplayName  isMultiline account={item.get('account')} />
											</div>
										</div>
										<div className={[_s.d, _s.mt15].join(' ')}>
											<WrappedBundle
												component={ProfileInfoPanel}
												componentParams={{
													noPanel: true,
													account: owner,
												}}
											/>
										</div>
									</div>
								</div>
							}

							{
								isOwner &&
								<div className={[_s.d, _s.px15, _s.py15, _s.mt5].join(' ')}>
									<div className={[_s.d, _s.flexRow].join(' ')}>
										<Text size='large' weight='bold' className={[_s.mt5, _s.mb5].join(' ')}>Potential Buyers</Text>
									</div>
									<div className={[_s.d, _s.mt15, _s.borderColorSecondary, _s.border1PX].join(' ')}>
										<WrappedBundle
											component={MarketplaceListingBuyers}
											componentParams={{
												marketplaceListingId: itemId,
											}}
										/>
									</div>
								</div>
							}

							{
								isOwner &&
								<div className={[_s.d, _s.px15, _s.py15, _s.mt5].join(' ')}>
									<div className={[_s.d, _s.flexRow].join(' ')}>
										<Text size='large' weight='bold' className={[_s.mt5, _s.mb5].join(' ')}>Status Change History</Text>
									</div>
									<div className={[_s.d, _s.mt15].join(' ')}>
										<WrappedBundle
											component={MarketplaceListingStatusChanges}
											componentParams={{
												marketplaceListingId: itemId,
											}}
										/>
									</div>
								</div>
							}

						</div>
					</div>
				</Block>
			</div>
		)
	}

}

const MarketplaceListingActionButtonGroup = ({
	onSave,
	saveTitle,
	shareBtnRef,
	onShare,
	moreBtnRef,
	onOpenMore
}) => (
	<div className={[_s.d, _s.flexRow].join(' ')}>
		<Button
			radiusSmall
			icon='bookmark'
			iconSize='16px'
			title='Save'
			color='primary'
			backgroundColor='tertiary'
			onClick={onSave}
			className={[_s.mr10, _s.aiCenter, _s.jcCenter, _s.flexGrow1].join(' ')}
		>
			<Text color='inherit' weight='bold' className={[_s.ml10].join(' ')}>
				{saveTitle}
			</Text>
		</Button>
		<Button
			radiusSmall
			icon='share'
			iconSize='16px'
			color='primary'
			backgroundColor='tertiary'
			buttonRef={shareBtnRef}
			onClick={onShare}
			className={[_s.mr10, _s.aiCenter, _s.jcCenter, _s.flexGrow1].join(' ')}
		>
			<Text color='inherit' weight='bold' className={[_s.ml10].join(' ')}>
				Share
			</Text>
		</Button>
		<Button
			radiusSmall
			icon='ellipsis'
			iconSize='20px'
			color='primary'
			backgroundColor='tertiary'
			buttonRef={moreBtnRef}
			onClick={onOpenMore}
		/>
	</div>
)

const mapStateToProps = (state, { params }) => {
	const itemId = isObject(params) ? params['id'] : null
	const item = state.getIn(['marketplace_listings', itemId], null)
  const category = state.getIn(['marketplace_listing_categories', 'item'])

	return {
		item,
		itemId,
    category,
		owner: !!item ? makeGetAccount()(state, item.getIn(['account', 'id'])) : null,
		error: (itemId && !item),
		isOwner: !!item ? item.getIn(['account', 'id']) === me : false
	}
}

const mapDispatchToProps = (dispatch) => ({
	onFetchMarketplaceItem(id) {
		dispatch(fetchMarketplaceListingById(id))
	},
	onOpenSharePopover(targetRef, marketplaceListing) {
		dispatch(openPopover(POPOVER_SHARE, {
			targetRef,
			marketplaceListing,
			position: 'bottom',
		}))
	},
	onSaveMarketplaceListing(marketplaceListing) {
		dispatch(saveMarketplaceListing(marketplaceListing.get('id')))
	},
	onUnsaveMarketplaceListing(marketplaceListing) {
		dispatch(unsaveMarketplaceListing(marketplaceListing.get('id')))
	},
	onIsMarketplaceListingSaved(marketplaceListing) {
		dispatch(isMarketplaceListingSaved(marketplaceListing.get('id')))
	},
	onOpenUnauthorizedModal() {
		dispatch(openModal(MODAL_UNAUTHORIZED))
	},
	onOpenMorePopover(targetRef, id) {
    dispatch(openPopover(POPOVER_MARKETPLACE_LISTING_OPTIONS, {
      targetRef,
      id,
    }))
  },
	onSendMessage(ownerId, history, listing, message = '') {
		// set convo
		dispatch(createChatConversation(ownerId, history, (chatConversationId) => {
			const spacer = !!message && message.length > 0 ? ' - ' : ' '
			const text = `${message}${spacer}${listing.get('url')}`
			if (chatConversationId) {
				dispatch(sendChatMessage({ text }, chatConversationId, listing.get('id')))
			}
		}))
	},
})

MarketplaceListingDetail.propTypes = {
	onFetchMarketplaceItem: PropTypes.func.isRequired,
	onSendMessage: PropTypes.func.isRequired,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MarketplaceListingDetail))
