import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { List as ImmutableList } from 'immutable'
import { makeGetNotification } from '../selectors'
import Notification from '../components/notification'
import { me } from '../initial_state'

const getAccountFromState = (state, accountId) => {
  return state.getIn(['accounts', accountId])
}

const makeMapStateToProps = () => {
  const getNotification = makeGetNotification()

  const mapStateToProps = (state, props) => {
    const isGME = props.notification && props.notification.get('type') == 'group_moderation_event'
    const isFollows = !!props.notification.get('follow')
    const isLikes = !!props.notification.get('like')
    const isQuote = !!props.notification.get('quote')
    const isReposts = !!props.notification.get('repost')
    const isGrouped = isFollows || isLikes || isReposts
    const lastReadId = state.getIn(['notifications', 'lastReadId'])
    const isDeckConnected = state.getIn(['deck', 'connected'], false)

    if (isFollows) {
      let lastUpdated

      const list = props.notification.get('follow')
      let accounts = ImmutableList()
      list.forEach((item) => {
        const account = getAccountFromState(state, item.get('account'))
        accounts = accounts.set(accounts.size, account)
        if (!lastUpdated) {
          lastUpdated = item.get('created_at')
        }
      })
  
      return {
        type: 'follow',
        accounts: accounts,
        createdAt: lastUpdated,
        statusId: undefined,
        isDeckConnected,
      }
    } else if (isQuote) {
      const list = props.notification.get('quote')
      let lastUpdated = list.get('lastUpdated')

      let accounts = ImmutableList()
      const accountIdArr = list.get('accounts')

      for (let i = 0; i < accountIdArr.length; i++) {
        const accountId = accountIdArr[i];
        const account = getAccountFromState(state, accountId)
        accounts = accounts.set(accounts.size, account)
      }

      return {
        type: 'quote',
        accounts: accounts,
        createdAt: lastUpdated,
        status: state.getIn(['statuses', list.get('status')], null),
        isDeckConnected,
      }
    } else if (isReposts) {
      const list = props.notification.get('repost')
      let lastUpdated = list.get('lastUpdated')

      let accounts = ImmutableList()
      const accountIdArr = list.get('accounts')

      for (let i = 0; i < accountIdArr.length; i++) {
        const accountId = accountIdArr[i];
        const account = getAccountFromState(state, accountId)
        accounts = accounts.set(accounts.size, account)
      }

      return {
        type: 'repost',
        accounts: accounts,
        createdAt: lastUpdated,
        status: state.getIn(['statuses', list.get('status')], null),
        isDeckConnected,
      }
    } else if (isLikes) {
      const list = props.notification.get('like')
      let reactionTypeId = list.get('reactionTypeId')
      let lastUpdated = list.get('lastUpdated')

      let accounts = ImmutableList()
      const accountIdArr = list.get('accounts')

      for (let i = 0; i < accountIdArr.length; i++) {
        const accountId = accountIdArr[i];
        const account = getAccountFromState(state, accountId)
        accounts = accounts.set(accounts.size, account)
      }

      let noReactionOrBasicLike = !reactionTypeId || reactionTypeId === '0'

      return {
        type: noReactionOrBasicLike ? 'like' : 'reaction',
        accounts: accounts,
        createdAt: lastUpdated,
        status: state.getIn(['statuses', list.get('status')], null),
        reactionType: noReactionOrBasicLike ? null : state.getIn(['reactions', 'all', reactionTypeId], null),
        isDeckConnected,
      }
    } else if (isGME) {
      const notification = getNotification(state, props.notification, props.notification.get('account'))
      const account = notification.get('account')
      const statusId = notification.get('status')
      return {
        type: notification.get('type'),
        accounts: account.get('id') !== me ? new ImmutableList([account]) : new ImmutableList(),
        group_id: notification.get('group_id'),
        group_name: notification.get('group_name'),
        createdAt: notification.get('created_at'),
        status: state.getIn(['statuses', statusId], null),
        isDeckConnected,
        approved: notification.get('approved'),
        rejected: notification.get('rejected'),
        removed: notification.get('removed'),
      }
    } else if (!isGrouped) {
      const notification = getNotification(state, props.notification, props.notification.get('account'))
      const account = notification.get('account')
      const statusId = notification.get('status')

      return {
        type: notification.get('type'),
        accounts: !!account ? ImmutableList([account]) : ImmutableList(),
        createdAt: notification.get('created_at'),
        status: state.getIn(['statuses', statusId], null),
        isDeckConnected,
      }
    }
  }

  return mapStateToProps
}

export default connect(makeMapStateToProps)(Notification)
