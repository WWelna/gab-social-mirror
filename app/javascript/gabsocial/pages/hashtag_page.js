import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import isObject from 'lodash/isObject'
import { me } from '../initial_state'
import PageTitle from '../features/ui/util/page_title'
import DefaultLayout from '../layouts/default_layout'
import {
  addShortcut,
  removeShortcut,
 } from '../actions/shortcuts' 
import {
  LinkFooter,
  ProgressPanel,
  TrendsBreakingPanel,
  UserSuggestionsPanel,
} from '../features/ui/util/async_components'

class HashtagPage extends React.PureComponent {

  handleOnToggleShortcut = () => {
    const {
      isShortcut,
      hashtag,
      shortcut,
      onAddShortcut,
      onRemoveShortcut
    } = this.props

    if (isShortcut) {
      onRemoveShortcut(shortcut)
    } else {
      onAddShortcut(hashtag)
    }
  }
    
  render() {
    const {
      isShortcut,
      children,
      showSuggestedUsers,
      hashtag,
    } = this.props

    const actions = !!me ? [{
      icon: isShortcut ? 'star' : 'star-outline',
      onClick: this.handleOnToggleShortcut,
    }] : []

    let sidebarLayout = [ProgressPanel, TrendsBreakingPanel]

    if(showSuggestedUsers) {
      sidebarLayout.push(UserSuggestionsPanel)
    }

    sidebarLayout.push(LinkFooter)

    return (
      <DefaultLayout
        showBackBtn
        title='Tag Timeline'
        page={`hashtag.${hashtag}`}
        layout={sidebarLayout}
        actions={actions}
      >
        <PageTitle path={`#${hashtag} timeline`} />
        <div className={[_s.d, _s.w100PC, _s.px15, _s.py15].join(' ')}>
          <span
            className={[_s.w100PC, _s.text, _s.fs15PX, _s.textOverflowEllipsis, _s.cPrimary].join(' ')}
            dangerouslySetInnerHTML={{ __html: `#${hashtag}` }}
          />
        </div>
        {children}
      </DefaultLayout>
    )
  }
}

const mapStateToProps = (state, { params }) => {
  const hashtag = `${isObject(params) ? params.id : ''}`.toLowerCase()
  const shortcuts = state.getIn(['shortcuts', 'items'])
  const shortcut = shortcuts.find((s) => {
    return `${s.get('title')}`.toLowerCase() == hashtag && s.get('shortcut_type') === 'tag'
  })

  return {
    hashtag,
    shortcut,
    isShortcut: !!shortcut,
  }
}

const mapDispatchToProps = (dispatch) => ({
  onAddShortcut(hashtag) {
    dispatch(addShortcut('tag', hashtag))
  },
  onRemoveShortcut(shortcut) {
    if (!shortcut) return
    dispatch(removeShortcut(shortcut.get('id'), 'tag'))
  },
})
 
 
HashtagPage.propTypes = {
  children: PropTypes.node.isRequired,
  onAddShortcut: PropTypes.func.isRequired,
  onRemoveShortcut: PropTypes.func.isRequired,
  hashtag: PropTypes.string.isRequired,
  params: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(HashtagPage)
