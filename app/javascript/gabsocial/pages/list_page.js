import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { openModal } from '../actions/modal'
import { openPopover } from '../actions/popover'
import {
  addShortcut,
  removeShortcut,
} from '../actions/shortcuts'
import {
  POPOVER_SHARE,
  MODAL_LIST_EDITOR,
  BREAKPOINT_EXTRA_SMALL,
} from '../constants'
import { me } from '../initial_state'
import PageTitle from '../features/ui/util/page_title'
import DefaultLayout from '../layouts/default_layout'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import ResponsiveComponent from '../features/ui/util/responsive_component'
import {
  ListDetailsPanel,
  LinkFooter,
  GabTVVideosPanel,
  ListHeader,
} from '../features/ui/util/async_components'

class ListPage extends ImmutablePureComponent {
  
  handleOnOpenListEditModal = () => {
    this.props.onOpenEditModal(this.props.listId)
  }

  handleOnShare = () => {
    this.props.onOpenSharePopover(this.shareNode, this.props.list)
  }

  handleOnToggleShortcut = () => {
    if (this.props.isShortcut) {
      this.props.onRemoveShortcut(this.props.list.get('id'))
    } else {
      this.props.onAddShortcut(this.props.list.get('id'))
    }
  }

  setShareNode = (c) => {
    this.shareNode = c
  }

  render() {
    const {
      children,
      list,
      listId,
      isListOwner,
      isShortcut,
      width,
      showVideos, 
    } = this.props

    const listTitle = !!list ? list.get('title') : ''
    const title = 'Feed'
    const isXS = width <= BREAKPOINT_EXTRA_SMALL

    const actions = isListOwner ? [
      {
        icon: 'cog',
        onClick: this.handleOnOpenListEditModal,
      },
    ] : isXS ? [
      {
        icon: 'share',
        onClick: this.handleOnShare,
      },
    ] : []
    if (!!me) {
      actions.push({
        icon: isShortcut ? 'star' : 'star-outline',
        onClick: this.handleOnToggleShortcut,
      })
    }

    let sidebarLayout = [ <WrappedBundle component={ListDetailsPanel} componentParams={{ listId }} />]

    if(showVideos) {
      sidebarLayout.push(GabTVVideosPanel)
    }

    sidebarLayout.push(LinkFooter)

    return (
      <DefaultLayout
        showBackBtn
        title={title}
        page='list'
        actions={actions}
        layout={sidebarLayout}
      >
        <PageTitle path={[listTitle, title]} />
        <ResponsiveComponent max={BREAKPOINT_EXTRA_SMALL}>
          <div ref={this.setShareNode} />
          <WrappedBundle component={ListHeader} componentParams={{ listId , isXS: true}} />,
        </ResponsiveComponent>
        { children }
      </DefaultLayout>
    )
  }
}

const mapStateToProps = (state, props) => {
  const listId = props.params.id
  const shortcuts = state.getIn(['shortcuts', 'items'])
  const isShortcut = !!shortcuts.find((s) => {
    return s.get('shortcut_id') == listId && s.get('shortcut_type') === 'list'
  })
  return {
    listId,
    isShortcut,
    list: state.getIn(['lists', 'items', listId]),
    isListOwner: state.getIn(['lists', 'items', listId, 'account', 'id'], null) === me,
    width: state.getIn(['settings', 'window_dimensions', 'width']),
  }
}

const mapDispatchToProps = (dispatch) => ({
  onAddShortcut(listId) {
    dispatch(addShortcut('list', listId))
  },
  onRemoveShortcut(listId) {
    dispatch(removeShortcut(null, 'list', listId))
  },
  onOpenEditModal(listId) {
    if (!listId) return

    dispatch(openModal(MODAL_LIST_EDITOR, {
      id: listId,
      tab: 'settings',
    }))
  },
  onOpenSharePopover(targetRef, list) {
    if (!list) return

    dispatch(openPopover(POPOVER_SHARE, {
      targetRef,
      list,
    }))
  },
})

ListPage.propTypes = {
  children: PropTypes.node.isRequired,
  dispatch: PropTypes.func.isRequired,
  listId: PropTypes.string,
  isListOwner: PropTypes.bool,
  list: ImmutablePropTypes.map,
}

export default connect(mapStateToProps, mapDispatchToProps)(ListPage)