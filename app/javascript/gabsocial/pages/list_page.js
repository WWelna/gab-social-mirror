import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { openModal } from '../actions/modal'
import { openPopover } from '../actions/popover'
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
  GabAdPanel,
  ListHeader,
} from '../features/ui/util/async_components'

class ListPage extends ImmutablePureComponent {
  
  handleOnOpenListEditModal = () => {
    const { listId } = this.props
    
    if (!listId) return
    
    this.props.dispatch(openModal(MODAL_LIST_EDITOR, {
      id: listId,
      tab: 'settings',
    }))
  }

  handleOnShare = () => {
    this.props.dispatch(openPopover(POPOVER_SHARE, {
      targetRef:this.shareNode,
      list: this.props.list,
    }))
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
      width,
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
    ] : null

    return (
      <DefaultLayout
        showBackBtn
        title={title}
        page='list'
        actions={actions}
        layout={[
          <WrappedBundle component={ListDetailsPanel} componentParams={{ listId }} />,
          GabAdPanel,
          GabTVVideosPanel,
          LinkFooter,
        ]}
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
  return {
    listId,
    list: state.getIn(['lists', 'items', listId]),
    isListOwner: state.getIn(['lists', 'items', listId, 'account', 'id'], null) === me,
    width: state.getIn(['settings', 'window_dimensions', 'width']),
  }
}

ListPage.propTypes = {
  children: PropTypes.node.isRequired,
  dispatch: PropTypes.func.isRequired,
  listId: PropTypes.string,
  isListOwner: PropTypes.bool,
  list: ImmutablePropTypes.map,
}

export default connect(mapStateToProps)(ListPage)