import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import debounce from 'lodash.debounce'
import { me } from '../initial_state'
import { expandSearch } from '../actions/search'
import {
  SEARCH_TAB_ACCOUNT,
  SEARCH_TAB_STATUS,
  SEARCH_TAB_GROUP,
  SEARCH_TAB_LINK,
  SEARCH_TAB_LIST,
  SEARCH_TAB_HASHTAG,
} from '../constants'
import ResponsiveClassesComponent from '../features/ui/util/responsive_classes_component'
import AccountPlaceholder from '../components/placeholder/account_placeholder'
import StatusPlaceholder from '../components/placeholder/status_placeholder'
import GroupListItemPlaceholder from '../components/placeholder/group_list_item_placeholder'
import ListItemPlaceholder from '../components/placeholder/list_item_placeholder'
import TrendsItemPlaceholder from '../components/placeholder/trends_item_placeholder'
import GroupListItem from '../components/group_list_item'
import Text from '../components/text'
import Account from '../components/account'
import ColumnIndicator from '../components/column_indicator'
import StatusContainer from '../containers/status_container'
import Block from '../components/block'
import PreviewCardItem from '../components/preview_card_item'
import List from '../components/list'
import ListListItem from '../components/list_list_item'
import ScrollableList from '../components/scrollable_list'
import Dummy from '../components/dummy'

class Search extends ImmutablePureComponent {

  state = {
    isSmallScreen: (window.innerWidth <= 895),
  }

  _getTab = () => {
    let { tab } = this.props
    // default... also set in actions/search
    if (!tab) tab = SEARCH_TAB_ACCOUNT
    return tab
  }

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandSearch(this._getTab()))
  }, 300, { leading: true })

  render() {
    const {
      isError,
      isLoading,
      results,
      submitted,
    } = this.props
    const { isSmallScreen } = this.state

    const tab = this._getTab()
    
    const isTop = false
    const theLimit = 4
    const tabBlock = !!tab ? results.get(tab) : null
    const resultsByTab = !!tabBlock ? tabBlock.get('items') : null
    const resultsSize = resultsByTab ? resultsByTab.size : 0
    const noResults = resultsSize === 0
    const size = isTop ? Math.min(resultsSize, theLimit) : resultsSize
    const isMax = size === resultsSize
    let LoadingPlaceholder = AccountPlaceholder
    let Wrapper = Block

    if ((isError || noResults) && !isLoading) {
      const message =
        isError ? 'Error fetching search results.' :
        noResults ? 'No search results.' : ''
      return (
        <ResponsiveClassesComponent classNamesXS={[_s.px10, _s.pt15].join(' ')}>
          <Block>
            <ColumnIndicator type='missing' message={message} />
          </Block>
        </ResponsiveClassesComponent>
      )
    }

    if ((results.isEmpty() && isSmallScreen) || (!submitted && results.isEmpty())) {
      return (
        <ResponsiveClassesComponent classNamesXS={[_s.px10, _s.pt15].join(' ')}>
          <Block>
            <div className={[_s.d, _s.py15, _s.px15].join(' ')}>
              <Text>Type in the box above and submit to perform a search.</Text>
            </div>
          </Block>
        </ResponsiveClassesComponent>
      )
    }

    let content = null
    if (tab === SEARCH_TAB_ACCOUNT) {
      content = resultsByTab.map((accountId) => (
        <Account
          compact
          withBio
          key={accountId}
          id={accountId}
        />
      ))
    } else if (tab === SEARCH_TAB_GROUP) {
      LoadingPlaceholder = GroupListItemPlaceholder
      content = resultsByTab.map((groupId, i) => (
        <GroupListItem
          withDescription
          withVisibility
          size='large'
          key={groupId}
          id={groupId}
          isLast={size - 1 === i}
        />
      ))
    } else if (tab === SEARCH_TAB_STATUS) {
      LoadingPlaceholder = StatusPlaceholder
      Wrapper = Dummy
      content = resultsByTab.map((statusId) => (
        <StatusContainer
          key={`status-${statusId}`}
          id={statusId}
          contextType='search'
          commentsLimited
        />
      ))
    } else if (tab === SEARCH_TAB_LINK) {
      LoadingPlaceholder = TrendsItemPlaceholder
      content = resultsByTab.map((linkId) => (
        <PreviewCardItem
          key={linkId}
          id={linkId}
          isBordered
        />
      ))
    } else if (tab === SEARCH_TAB_HASHTAG) {
      const hashtagListItems = resultsByTab.map((tag) => {
        return {
          title: `#${tag.get('name')}`,
          to: `/tags/${tag.get('name')}`,
        }
      })

      return <List items={hashtagListItems} />
    } else if (tab === SEARCH_TAB_LIST) {
      LoadingPlaceholder = ListItemPlaceholder
      content = resultsByTab.map((listId) => (
        <ListListItem 
          key={listId}
          id={listId}
        />
      ))
    }

    return (
      <Wrapper>
        <ScrollableList
          scrollKey={`search-${tab}`}
          hasMore={!!tabBlock.get('next')}
          isLoading={isLoading}
          showLoading={isLoading && resultsSize === 0}
          onLoadMore={this.handleLoadMore}
          placeholderComponent={LoadingPlaceholder}
          placeholderCount={4}
        >
          {content}
        </ScrollableList>
      </Wrapper>
    )
  }

}

const mapStateToProps = (state) => ({
  isError: state.getIn(['search', 'isError']),
  isLoading: state.getIn(['search', 'isLoading']),
  results: state.getIn(['search', 'results']),
  submitted: state.getIn(['search', 'submitted']),
  tab: state.getIn(['search', 'tab']),
})

Search.propTypes = {
  isError: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  location: PropTypes.object,
  results: ImmutablePropTypes.map.isRequired,
  submitted: PropTypes.bool.isRequired,
}

export default connect(mapStateToProps)(Search)
