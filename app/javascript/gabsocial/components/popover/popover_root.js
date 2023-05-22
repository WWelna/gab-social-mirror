import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import get from 'lodash/get'

import {
  BREAKPOINT_EXTRA_SMALL,
  POPOVER_CHAT_CONVERSATION_EXPIRATION_OPTIONS,
  POPOVER_CHAT_CONVERSATION_OPTIONS,
  POPOVER_CHAT_MESSAGE_OPTIONS,
  POPOVER_CHAT_SETTINGS,
  POPOVER_COMMENT_SORTING_OPTIONS,
  POPOVER_COMPOSE_MEDIA_DESCRIPTION,
  POPOVER_COMPOSE_POST_CONTEXT,
  POPOVER_COMPOSE_POST_DESTINATION,
  POPOVER_DATE_PICKER,
  POPOVER_EMOJI_PICKER,
  POPOVER_GROUP_LIST_SORT_OPTIONS,
  POPOVER_GROUP_MEMBER_OPTIONS,
  POPOVER_GROUP_OPTIONS,
  POPOVER_GROUP_TIMELINE_SORT_OPTIONS,
  POPOVER_GROUP_TIMELINE_SORT_TOP_OPTIONS,
  POPOVER_EXPLORE_TIMELINE_SORT_OPTIONS,
  POPOVER_EXPLORE_TIMELINE_SORT_TOP_OPTIONS,
  POPOVER_HOME_TIMELINE_SORT_OPTIONS,
  POPOVER_LISTS_SORT_OPTIONS,
  POPOVER_MARKETPLACE_LISTING_CHANGE_STATUS,
  POPOVER_MARKETPLACE_LISTING_DASHBOARD_STATUS_OPTIONS,
  POPOVER_MARKETPLACE_LISTING_OPTIONS,
  POPOVER_NAV_SETTINGS,
  POPOVER_NOTIFICATION_SETTINGS,
  POPOVER_PROFILE_OPTIONS,
  POPOVER_SIDEBAR_MORE,
  POPOVER_STATUS_OPTIONS,
  POPOVER_STATUS_MODAL_CONFIRM,
  POPOVER_STATUS_EXPIRATION_OPTIONS,
  POPOVER_SHARE,
  POPOVER_STATUS_REACTIONS_COUNT,
  POPOVER_STATUS_REACTIONS_SELECTOR,
  POPOVER_STATUS_VISIBILITY,
  POPOVER_TIMELINE_INJECTION_OPTIONS,
  POPOVER_USER_INFO,
  POPOVER_VIDEO_STATS,
} from '../../constants'

import {
  ChatConversationExpirationOptionsPopover,
  ChatConversationOptionsPopover,
  ChatMessageOptionsPopover,
  ChatSettingsPopover,
  CommentSortingOptionsPopover,
  ComposeMediaDescriptionPopover,
  ComposePostContextPopover,
  ComposePostDesinationPopover,
  DatePickerPopover,
  EmojiPickerPopover,
  GroupListSortOptionsPopover,
  GroupMemberOptionsPopover,
  GroupOptionsPopover,
  GroupTimelineSortOptionsPopover,
  GroupTimelineSortTopOptionsPopover,
  ExploreTimelineSortOptionsPopover,
  ExploreTimelineSortTopOptionsPopover,
  HomeTimelineSortOptionsPopover,
  ListsSortOptionsPopover,
  MarketplaceListingChangeStatusPopover,
  MarketplaceListingDashboardStatusOptionsPopover,
  MarketplaceListingOptionsPopover,
  NavSettingsPopover,
  NotificationSettingsPopover,
  ProfileOptionsPopover,
  SidebarMorePopover,
  StatusExpirationOptionsPopover,
  StatusOptionsPopover,
  StatusModalConfirmPopover,
  SharePopover,
  StatusReactionsCountPopover,
  StatusReactionsSelectorPopover,
  StatusVisibilityPopover,
  TimelineInjectionOptionsPopover,
  UserInfoPopover,
  VideoStatsPopover
} from '../../features/ui/util/async_components'

import { closePopover, closePopoverDeferred } from '../../actions/popover'
import Bundle from '../../features/ui/util/bundle'
import ModalBase from '../modal/modal_base'
import PopoverBase from './popover_base'
import ErrorPopover from './error_popover'
import LoadingPopover from './loading_popover'

const POPOVER_COMPONENTS = {
  [POPOVER_CHAT_CONVERSATION_EXPIRATION_OPTIONS]: ChatConversationExpirationOptionsPopover,
  [POPOVER_CHAT_CONVERSATION_OPTIONS]: ChatConversationOptionsPopover,
  [POPOVER_CHAT_MESSAGE_OPTIONS]: ChatMessageOptionsPopover,
  [POPOVER_CHAT_SETTINGS]: ChatSettingsPopover,
  [POPOVER_COMMENT_SORTING_OPTIONS]: CommentSortingOptionsPopover,
  [POPOVER_COMPOSE_MEDIA_DESCRIPTION]: ComposeMediaDescriptionPopover,
  [POPOVER_COMPOSE_POST_CONTEXT]: ComposePostContextPopover,
  [POPOVER_COMPOSE_POST_DESTINATION]: ComposePostDesinationPopover,
  [POPOVER_DATE_PICKER]: DatePickerPopover,
  [POPOVER_EMOJI_PICKER]: EmojiPickerPopover,
  [POPOVER_GROUP_LIST_SORT_OPTIONS]: GroupListSortOptionsPopover,
  [POPOVER_GROUP_MEMBER_OPTIONS]: GroupMemberOptionsPopover,
  [POPOVER_GROUP_OPTIONS]: GroupOptionsPopover,
  [POPOVER_GROUP_TIMELINE_SORT_OPTIONS]: GroupTimelineSortOptionsPopover,
  [POPOVER_GROUP_TIMELINE_SORT_TOP_OPTIONS]: GroupTimelineSortTopOptionsPopover,
  [POPOVER_EXPLORE_TIMELINE_SORT_OPTIONS]: ExploreTimelineSortOptionsPopover,
  [POPOVER_EXPLORE_TIMELINE_SORT_TOP_OPTIONS]: ExploreTimelineSortTopOptionsPopover,
  [POPOVER_HOME_TIMELINE_SORT_OPTIONS]: HomeTimelineSortOptionsPopover,
  [POPOVER_LISTS_SORT_OPTIONS]: ListsSortOptionsPopover,
  [POPOVER_MARKETPLACE_LISTING_CHANGE_STATUS]: MarketplaceListingChangeStatusPopover,
  [POPOVER_MARKETPLACE_LISTING_DASHBOARD_STATUS_OPTIONS]: MarketplaceListingDashboardStatusOptionsPopover,
  [POPOVER_MARKETPLACE_LISTING_OPTIONS]: MarketplaceListingOptionsPopover,
  [POPOVER_NAV_SETTINGS]: NavSettingsPopover,
  [POPOVER_NOTIFICATION_SETTINGS]: NotificationSettingsPopover,
  [POPOVER_PROFILE_OPTIONS]: ProfileOptionsPopover,
  [POPOVER_SIDEBAR_MORE]: SidebarMorePopover,
  [POPOVER_STATUS_OPTIONS]: StatusOptionsPopover,
  [POPOVER_STATUS_MODAL_CONFIRM]: StatusModalConfirmPopover,
  [POPOVER_STATUS_EXPIRATION_OPTIONS]: StatusExpirationOptionsPopover,
  [POPOVER_SHARE]: SharePopover,
  [POPOVER_STATUS_REACTIONS_COUNT]: StatusReactionsCountPopover,
  [POPOVER_STATUS_REACTIONS_SELECTOR]: StatusReactionsSelectorPopover,
  [POPOVER_STATUS_VISIBILITY]: StatusVisibilityPopover,
  [POPOVER_TIMELINE_INJECTION_OPTIONS]: TimelineInjectionOptionsPopover,
  [POPOVER_USER_INFO]: UserInfoPopover,
  [POPOVER_VIDEO_STATS]: VideoStatsPopover
}

class PopoverRoot extends React.PureComponent {
  get isReactionsSelectorPopover() {
    return this.props.popoverType === POPOVER_STATUS_REACTIONS_SELECTOR
  }

  get visible() {
    const { popoverType } = this.props
    return typeof popoverType === 'string' && popoverType.length > 0
  }

  renderLoading = () => {
    const { width, onClose } = this.props
    const isXS = width <= BREAKPOINT_EXTRA_SMALL
    if (this.isReactionsSelectorPopover) return null
    return <LoadingPopover isXS={isXS} onClose={onClose} />
  }

  renderError = () => {
    const { width, onClose } = this.props
    const isXS = width <= BREAKPOINT_EXTRA_SMALL
    if (this.isReactionsSelectorPopover) return null
    return <ErrorPopover isXS={isXS} onClose={onClose} />
  }

  render() {
    const { visible } = this
    const { popoverType, popoverProps, onClose, width } = this.props
    const isXS = width <= BREAKPOINT_EXTRA_SMALL
    const Wrapper =
      isXS && !this.isReactionsSelectorPopover ? ModalBase : PopoverBase

    //If is XS and popover is user info, dont show
    //Since on mobile this should not be visible
    if (isXS && popoverType === POPOVER_USER_INFO) return null

    return (
      <Wrapper onClose={onClose} visible={visible} {...popoverProps}>
        {visible && (
          <Bundle
            fetchComponent={POPOVER_COMPONENTS[popoverType]}
            loading={this.renderLoading}
            error={this.renderError}
          >
            {Component => (
              <Component isXS={isXS} onClose={onClose} {...popoverProps} />
            )}
          </Bundle>
        )}
      </Wrapper>
    )
  }
}

const mapStateToProps = state => ({
  popoverType: state.getIn(['popover', 'popoverType']),
  popoverProps: state.getIn(['popover', 'popoverProps'], {}),
  width: state.getIn(['settings', 'window_dimensions', 'width'])
})

const mapDispatchToProps = dispatch => ({
  onClose() {
    const timeout = get(this, 'props.popoverProps.timeout')
    if (timeout) {
      // allows for a grace period between opening and closing for hover popovers
      return dispatch(closePopoverDeferred())
    }
    dispatch(closePopover())
  }
})

PopoverRoot.propTypes = {
  popoverType: PropTypes.string,
  popoverProps: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  width: PropTypes.number
}

export default connect(mapStateToProps, mapDispatchToProps)(PopoverRoot)
