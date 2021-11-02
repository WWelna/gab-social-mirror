import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  fetchChatConversationAccountSuggestions,
  clearChatConversationAccountSuggestions,
} from '../actions/chats'
import { showToast } from '../actions/toasts'
import { me } from '../initial_state'
import { TOAST_TYPE_SUCCESS } from '../constants'
import { createChatConversation } from '../actions/chat_conversations'
import Account from '../components/account'
import Input from '../components/input'
import Text from '../components/text'
import Button from '../components/button'
import AccountPills from '../components/account_pills'

class ChatConversationCreate extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
  }

  state = {
    query: '',
    selectedAccountIds: [],
  }

  onChange = (query) => {
    this.setState({ query })
    this.props.onChange(query)
  }

  handleOnDeselectAccountId = (accountId) => {
    if (!accountId) return

    const { selectedAccountIds } = this.state

    const indexOfAccountId = selectedAccountIds.indexOf(`${accountId}`)

    if (indexOfAccountId > -1) {
      this.setState({
        selectedAccountIds: selectedAccountIds.filter((aId) => aId !== accountId),
      })
    }
  }

  handleOnSelectAccountId = (account) => {
    if (!account) return

    const accountId = account.get('id')

    const { selectedAccountIds } = this.state
    const { isPro } = this.props
    const count = selectedAccountIds.length

    if (selectedAccountIds.indexOf(accountId) === -1) {
      if ((count < 1 && !isPro) || (isPro && count <= 50)) {
        const newArr = selectedAccountIds.concat(`${accountId}`);
        this.setState({ selectedAccountIds: newArr })
      } else {
        const msg = isPro ? 'You can only chat with a maximum of 50 people' : 'You can only select one account'
        this.props.onShowToast(msg)
      }
    } else {
      this.handleOnDeselectAccountId(accountId)
    }
  }

  handleOnCreateChatConversation = () => {
    const { selectedAccountIds } = this.state

    if (this.props.isModal && !!this.props.onCloseModal) {
      this.props.onCloseModal()
    }

    this.props.onCreateChatConversation(selectedAccountIds, this.context.router.history)
    this.props.onClearChatConversationAccountSuggestions()
  }

  render() {
    const { suggestionsIds } = this.props
    const { query, selectedAccountIds } = this.state

    const pills = selectedAccountIds.map((accountId) => {
      return {
        accountId,
        onClick: () => {
          return this.handleOnDeselectAccountId(accountId)
        },
      }
    })

    return (
      <div className={[_s.d, _s.bgPrimary, _s.w100PC, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
        <div className={[_s.d, _s.px15, _s.pt10].join(' ')}>
          <Input
            placeholder='Search for a user'
            prependIcon='search'
            value={query}
            onChange={this.onChange}
          />
        </div>

        {
          selectedAccountIds && selectedAccountIds.length > 0 &&
          <div className={[_s.d, _s.px10, _s.mt10, _s.mb5, _s.pb5, _s.flexRow, _s.width100PC, _s.overflowHidden, _s.overflowXScroll, _s.noScrollbar, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
            <AccountPills pills={pills} />
          </div>
        }

        <div className={[_s.d, _s.pt10].join(' ')}>
          {
            suggestionsIds && !!query &&
            suggestionsIds.map((accountId) => (
              <Account
                compact
                noClick
                key={`chat-conversation-account-create-${accountId}`}
                id={accountId}
                onActionClick={this.handleOnSelectAccountId}
                actionIcon={selectedAccountIds.indexOf(`${accountId}`) > -1 ? 'close' : 'add'}
              />
            ))
          }
        </div>
        <div className={[_s.d, _s.px15, _s.py10].join(' ')}>
          <Button onClick={this.handleOnCreateChatConversation}>
            <Text color='inherit' weight='medium' align='center'>
              Next
            </Text>
          </Button>
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state) => ({
  suggestionsIds: state.getIn(['chats', 'createChatConversationSuggestionIds']),
  isPro: state.getIn(['accounts', me, 'is_pro']),
})

const mapDispatchToProps = (dispatch) => ({
  onChange(value) {
    dispatch(fetchChatConversationAccountSuggestions(value))
  },
  onCreateChatConversation(accountId, routerHistory) {
    dispatch(createChatConversation(accountId, routerHistory))
  },
  onClearChatConversationAccountSuggestions() {
    dispatch(clearChatConversationAccountSuggestions())
  },
  onShowToast(message) {
    dispatch(showToast(TOAST_TYPE_SUCCESS, {
      type: message,
    }))
  },
})

ChatConversationCreate.propTypes = {
  onChange: PropTypes.func.isRequired,
  onCreateChatConversation: PropTypes.func.isRequired,
  onClearChatConversationAccountSuggestions: PropTypes.func.isRequired,
  onShowToast: PropTypes.func.isRequired,
  isModal: PropTypes.bool,
  isPro: PropTypes.bool,
  query: PropTypes.string,
  suggestionsIds: ImmutablePropTypes.list,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatConversationCreate)