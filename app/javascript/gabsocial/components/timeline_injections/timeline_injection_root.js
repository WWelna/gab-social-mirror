import {
  BREAKPOINT_EXTRA_SMALL,
  TIMELINE_INJECTION_FEATURED_GROUPS,
  TIMELINE_INJECTION_PROGRESS,
  TIMELINE_INJECTION_PRO_UPGRADE,
  // TIMELINE_INJECTION_PWA,
  TIMELINE_INJECTION_SHOP,
  TIMELINE_INJECTION_USER_SUGGESTIONS,
  TIMELINE_INJECTION_GAB_TV_EXPLORE,
} from '../../constants'
import {
  FeaturedGroupsInjection,
  // GroupCategoriesInjection,
  ProgressInjection,
  ProUpgradeInjection,
  // PWAInjection,
  ShopInjection,
  UserSuggestionsInjection,
  GabTVVideosInjection,
} from '../../features/ui/util/async_components'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Bundle from '../../features/ui/util/bundle'

import {
  showVideos,
  showSuggestedUsers,
  showGroups
} from '../../initial_state'

/**
 * These injections always load but the others only load if the user preference
 * is turned on.
 */
const INJECTION_COMPONENTS = {
  [TIMELINE_INJECTION_PROGRESS]: ProgressInjection,
  [TIMELINE_INJECTION_PRO_UPGRADE]: ProUpgradeInjection,
  [TIMELINE_INJECTION_SHOP]: ShopInjection,
  [TIMELINE_INJECTION_FEATURED_GROUPS]: showGroups && FeaturedGroupsInjection,
  [TIMELINE_INJECTION_USER_SUGGESTIONS]:showSuggestedUsers && UserSuggestionsInjection,
  [TIMELINE_INJECTION_GAB_TV_EXPLORE]: showVideos && GabTVVideosInjection,
  // [TIMELINE_INJECTION_PWA]: PWAInjection,
  // [TIMELINE_INJECTION_GROUP_CATEGORIES]: GroupCategoriesInjection,
}

class TimelineInjectionRoot extends React.PureComponent {
  renderLoading = () => {
    return <div />
  }

  renderError = () => {
    return <div />
  }

  render() {
    const { width, type, index } = this.props

    const injectionKey = type || combinedInjections[index]
    if (!injectionKey) return

    const comp = INJECTION_COMPONENTS[injectionKey]
    if (!comp) return null // not loaded yet

    const isXS = width <= BREAKPOINT_EXTRA_SMALL

    return (
      <div>
        <Bundle
          fetchComponent={comp}
          loading={this.renderLoading}
          error={this.renderError}
        >
          {Component => (
            <Component isXS={isXS} injectionId={injectionKey} />
          )}
        </Bundle>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  width: state.getIn(['settings', 'window_dimensions', 'width'])
})

TimelineInjectionRoot.propTypes = {
  width: PropTypes.number,
  index: PropTypes.number,
  type: PropTypes.string,
  subProps: PropTypes.object,
}

export default connect(mapStateToProps)(TimelineInjectionRoot)
