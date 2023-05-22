import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import moment from 'moment-mini'
import {
  MODAL_LIST_EDITOR,
  MODAL_LIST_MEMBERS,
  MODAL_LIST_SUBSCRIBERS,
} from '../constants'
import { me} from '../initial_state'
import { shortNumberFormat } from '../utils/numbers'
import { openModal } from '../actions/modal'
import { fetchListRelationships } from '../actions/lists'
import ColumnIndicator from './column_indicator'
import Divider from './divider'
import Icon from './icon'
import Text from './text'
import DisplayName from './display_name'
import Avatar from './avatar'
import Button from './button'
import UserStat from './user_stat'
import ListActionButton from './list_action_button'

class ListHeader extends ImmutablePureComponent {

  render() {
    const {
      list,
      onEdit,
      onOpenMembers,
      onOpenSubscribers,
    } = this.props

    if (!list) return null

    const account = list.get('account')
    const isOwner = account.get('id') === me
    const memberCount = list.get('member_count')
    const subscriberCount = list.get('subscriber_count')
    const visibility = list.get('visibility')
    const subscribersTitle = `subscriber${subscriberCount === 0 || subscriberCount > 1 ? 's' : ''}`
    const membersTitle = `member${memberCount === 0 || memberCount > 1 ? 's' : ''}`

    return (
      <div className={[_s.d, _s.aiCenter, _s.jcCenter, _s.bgPrimary, _s.borderBottom1PX, _s.borderColorSecondary, _s.py15, _s.px10].join(' ')}>
          <Text weight='extraBold' size='extraLarge' align='center'>
            {list.get('title')}
          </Text>

          <div className={[_s.d, _s.mt10].join(' ')}>
            <Text size='small' color='secondary' className={_s.capitalize}>
              <Icon id={visibility === 'private' ? 'lock' : 'globe'} className={_s.mr5} />
              {visibility}
            </Text>
          </div>

          <div className={[_s.d, _s.mt10, _s.flexRow, _s.aiCenter].join(' ')}>
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

          <div className={[_s.d, _s.flexRow, _s.mt10].join(' ')}>
            <UserStat
              isInline
              onClick={onOpenMembers}
              title={membersTitle}
              numvalue={memberCount}
              value={shortNumberFormat(memberCount)}
            />
            <UserStat
              isInline
              isLast
              onClick={isOwner ? onOpenSubscribers : null}
              title={subscribersTitle}
              numvalue={subscriberCount}
              value={shortNumberFormat(subscriberCount)}
            />
          </div>

          {
            visibility === 'public' && !isOwner &&
            <div className={[_s.d, _s.mt10].join(' ')}>
              <ListActionButton list={list} />
            </div>
          }

      </div>
    )
  }
}

const mapStateToProps = (state, { listId }) => ({
  list: state.getIn(['lists', 'items', listId])
})

const mapDispatchToProps = (dispatch, { listId }) => ({
  onOpenMembers() {
    if (!me) return dispatch(openModal('UNAUTHORIZED'))
    dispatch(openModal(MODAL_LIST_MEMBERS, { listId }))
  },
  onOpenSubscribers() {
    if (!me) return dispatch(openModal('UNAUTHORIZED'))
    dispatch(openModal(MODAL_LIST_SUBSCRIBERS, { listId }))
  },
  onFetchListRelationships() {
    // dispatch(fetchListRelationships(listId))
  },
})

ListHeader.propTypes = {
  list: ImmutablePropTypes.map,
  onOpenMembers: PropTypes.func.isRequired,
  onOpenSubscribers: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ListHeader)