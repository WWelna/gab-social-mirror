import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { List as ImmutableList } from 'immutable'
import { makeGetNotification } from '../selectors'
import Notification from '../components/notification'

const getAccountFromState = (state, accountId) => {
  return state.getIn(['accounts', accountId])
}

const makeMapStateToProps = () => {
  const getNotification = makeGetNotification()

  const mapStateToProps = (state, props) => {
    const isFollows = !!props.notification.get('follow')
    const isLikes = !!props.notification.get('like')
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
