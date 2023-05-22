import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import moment from 'moment-mini'
import {
  MODAL_LIST_EDITOR,
  MODAL_LIST_MEMBERS,
  MODAL_LIST_SUBSCRIBERS,
  POPOVER_SHARE,
} from '../../constants'
import { me} from '../../initial_state'
import { openModal } from '../../actions/modal'
import { openPopover } from '../../actions/popover'
import PanelLayout from './panel_layout'
import ColumnIndicator from '../column_indicator'
import Divider from '../divider'
import Icon from '../icon'
import Text from '../text'
import DisplayName from '../display_name'
import Avatar from '../avatar'
import Button from '../button'
import ListActionButton from '../list_action_button'

class ListDetailsPanel extends ImmutablePureComponent {

  handleOnShare() {
    this.props.onShare(this.shareNode, this.props.list)
  }

  setShareNode = (c) => {
    this.shareNode = c
  }

  render() {
    const {
      list,
      onEdit,
      onOpenMembers,
      onOpenSubscribers,
    } = this.props

    const isOwner = !!list ? list.getIn(['account', 'id'], null) === me : false
    const title = !!list ? list.get('title') : ''
    const visibility = !!list ? list.get('visibility') : ''
    const visibilityIcon = visibility === 'private' ? 'lock' : 'globe'
    const createdAt = !!list ? list.get('created_at') : ''
    const account = !!list ? list.get('account') : null
    const subscribersTitle = !!list ? `${list.get('subscriber_count')} subscriber${list.get('subscriber_count') > 1 ? 's' : ''}` : null
    const membersTitle = !!list ? `${list.get('member_count')} member${list.get('member_count') > 1 ? 's' : ''}` : null
    const shareTitle = visibility === 'public' ? (
      <div ref={this.setShareNode}>
        <Icon id='share' className={_s.mr5}/>
        <Text color='inherit' weight='bold'>Share</Text>
      </div>
    ) : null

    return (
      <PanelLayout
        title='Feed Information'
        headerButtonTitle={isOwner ? 'Edit' : shareTitle}
        headerButtonAction={isOwner ? onEdit : this.handleOnShare.bind(this)}
      >
        {
          (!title || !createdAt) &&
          <ColumnIndicator type='loading' />
        }
        {
          title && createdAt &&
          <div className={_s.d}>

            <div className={_s.d}>
              <Text weight='medium'>
                {title}
              </Text>
            </div>

            {
              visibility === 'public' && !isOwner &&
              <div className={[_s.d, _s.flexRow, _s.mt10].join(' ')}>
                <ListActionButton list={list} />
              </div>
            }

            <Divider isSmall />

            <div className={_s.d}>
              <Text size='small' color='secondary' className={_s.capitalize}>
                <Icon id={visibilityIcon} className={_s.mr5} />
                {visibility}
              </Text>
            </div>

            <Divider isSmall />

            <div className={[_s.d, _s.flexRow, _s.aiCenter].join(' ')}>
              <Text size='small' color='secondary'>
                <Icon id='group' className={_s.mr5} />
                {membersTitle}
              </Text>

              <Button
                isText
                onClick={onOpenMembers}
                backgroundColor='none'
                color='brand'
                className={[_s.mlAuto, _s.py2].join(' ')}
              >
                View members
              </Button>
            </div>

            {
              visibility === 'public' &&
              <React.Fragment>
                <Divider isSmall />
                <div className={[_s.d, _s.mt5, _s.flexRow, _s.aiCenter].join(' ')}>
                  <Text size='small' color='secondary'>
                    <Icon id='group' className={_s.mr5} />
                    {subscribersTitle}
                  </Text>
                  { isOwner &&
                    <Button
                      isText
                      onClick={onOpenSubscribers}
                      backgroundColor='none'
                      color='brand'
                      className={[_s.mlAuto, _s.py2].join(' ')}
                    >
                      View subscribers
                    </Button>
                  }
                </div>
              </React.Fragment>
            }

            <Divider isSmall />

            <div className={[_s.d, _s.flexRow, _s.aiCenter].join(' ')}>
              <Icon id='calendar' size='12px' className={_s.cSecondary} />
              <Text
                size='small'
                color='secondary'
                className={_s.ml5}
              >
                {
                  <FormattedMessage id='lists.panel_created' defaultMessage='Created: {date}' values={{
                    date: moment(createdAt).format('lll'),
                  }} />
                }
              </Text>
            </div>

            <Divider isSmall />

            <div className={[_s.d, _s.mt5, _s.flexRow, _s.aiCenter].join(' ')}>
              <Text size='small' color='secondary'>Created by&nbsp;</Text>
              { !isOwner && <Avatar account={account} size={18} /> }
              { isOwner && <Text size='small' color='secondary'>you</Text> }
              { !isOwner &&
                <NavLink
                  to={`/${account.get('username')}`}
                  className={_s.noUnderline}
                >
                  <DisplayName isSmall account={account} />
                </NavLink>
              }
            </div>

          </div>
        }
      </PanelLayout>
    )
  }
}

const mapStateToProps = (state, { listId }) => ({
  list: state.getIn(['lists', 'items', listId])
})

const mapDispatchToProps = (dispatch, { listId }) => ({
  onShare(targetRef, list) {
    dispatch(openPopover(POPOVER_SHARE, {
      targetRef,
      list,
    }))
  },
  onEdit() {
    dispatch(openModal(MODAL_LIST_EDITOR, {
      id: listId,
      tab: 'settings',
    }))
  },
  onOpenMembers() {
    if (!me) return dispatch(openModal('UNAUTHORIZED'))
    dispatch(openModal(MODAL_LIST_MEMBERS, { listId }))
  },
  onOpenSubscribers() {
    if (!me) return dispatch(openModal('UNAUTHORIZED'))
    dispatch(openModal(MODAL_LIST_SUBSCRIBERS, { listId }))
  },
})

ListDetailsPanel.propTypes = {
  list: ImmutablePropTypes.map,
  onEdit: PropTypes.func.isRequired,
  onOpenMembers: PropTypes.func.isRequired,
  onOpenSubscribers: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ListDetailsPanel)