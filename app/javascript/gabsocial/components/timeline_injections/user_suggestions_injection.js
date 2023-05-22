import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { defineMessages, injectIntl } from 'react-intl'
import { me } from '../../initial_state'
import Account from '../account'
import TimelineInjectionLayout from './timeline_injection_layout'

class UserSuggestionsInjection extends ImmutablePureComponent {
  render() {
    const { intl, isXS, suggestions, suggestionType, injectionId } = this.props

    if (suggestions.isEmpty()) return <div />

    const title =
      suggestionType === 'verified'
        ? intl.formatMessage(messages.verifiedTitle)
        : intl.formatMessage(messages.relatedTitle)

    return (
      <TimelineInjectionLayout
        id={injectionId}
        title={title}
        buttonLink="/suggestions"
        buttonTitle="See more recommendations"
        isXS={isXS}
      >
        {suggestions.map(accountId => {
          // dont show myself as a suggestion
          if (accountId === me) return null

          return (
            <Account
              isCard
              key={`user_suggestion_injection_${accountId}`}
              id={accountId}
            />
          )
        })}
      </TimelineInjectionLayout>
    )
  }
}

const messages = defineMessages({
  dismissSuggestion: {
    id: 'suggestions.dismiss',
    defaultMessage: 'Dismiss suggestion'
  },
  relatedTitle: { id: 'who_to_follow.title', defaultMessage: 'Who to Follow' },
  verifiedTitle: {
    id: 'who_to_follow.verified_title',
    defaultMessage: 'Verified Accounts to Follow'
  },
  show_more: { id: 'who_to_follow.more', defaultMessage: 'Show more' }
})

const mapStateToProps = (state, { suggestionType = 'related' }) => ({
  suggestions: state.getIn(['suggestions', suggestionType, 'items']),
  isLoading: state.getIn(['suggestions', suggestionType, 'isLoading'])
})

UserSuggestionsInjection.propTypes = {
  suggestionType: PropTypes.oneOf(['related', 'verified']),
  fetchRelatedSuggestions: PropTypes.func,
  fetchPopularSuggestions: PropTypes.func,
  intl: PropTypes.object,
  suggestions: ImmutablePropTypes.list,
  isLoading: PropTypes.bool,
  isXS: PropTypes.bool,
  injectionId: PropTypes.string
}

UserSuggestionsInjection.defaultProps = {
  suggestionType: 'related'
}

export default injectIntl(connect(mapStateToProps)(UserSuggestionsInjection))
