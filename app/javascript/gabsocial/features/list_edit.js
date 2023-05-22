import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { injectIntl, defineMessages } from 'react-intl'
import isObject from 'lodash/isObject'
import throttle from 'lodash/throttle'
import {
  setupListEditor,
  resetListEditor,
  addToListEditor,
  fetchListSuggestions,
  clearListSuggestions,
  changeListSuggestions,
  changeListEditorTitle,
  changeListEditorSlug,
  changeListEditorVisibility,
  submitListEditor,
} from '../actions/list_editor'
import {
  openModal,
  closeModal,
} from '../actions/modal'
import {
  MODAL_LIST_EDITOR,
  MODAL_LIST_DELETE,
} from '../constants'
import { me, isStaff } from '../initial_state'
import Account from '../components/account'
import Button from '../components/button'
import Divider from '../components/divider'
import Input from '../components/input'
import TabBar from '../components/tab_bar'
import Text from '../components/text'
import Select from '../components/select'
import ListMembers from './list_members'

class ListEdit extends ImmutablePureComponent {

  state = {
    activeTab: this.props.tab || 'settings'
  }

  componentDidMount() {
    const { onInitialize, listId } = this.props
    if (listId) onInitialize(listId)
  }

  componentDidUpdate(prevProps) {
    if (this.props.listId !== prevProps.listId) {
      this.props.onInitialize(this.props.listId)
    }
  }

  componentWillUnmount() {
    this.props.onReset()
  }

  handleChangeTab = (tab) => {
    this.setState({ activeTab: tab })
  }

  onClickClose = () => {
    this.props.onClose(MODAL_LIST_EDITOR)
  }

  handleOnDeleteList = () => {
    this.props.onDeleteList(this.props.list)
  }

  handleOnAddAccountToList = (accountId) => {
    this.props.onAddAccountToList(accountId)
  }

  handleSearchSuggestionsChange = (value) => {
    this.props.onChangeSuggestions(value)
  }

  handleSearchSuggestionsKeyUp = throttle(() => {
    this.props.onSubmitSearchSuggestions(this.props.searchSuggestionsValue)
  }, 1000, { leading: true, trailing: true })

  handleSearchSuggestionsSubmit = () => {
    this.props.onSubmitSearchSuggestions(this.props.searchSuggestionsValue)
  }

  render() {
    const {
      title,
      slug,
      searchAccountIds,
      intl,
      searchSuggestionsValue,
      visibility,
      onChangeTitle,
      onChangeSlug,
      onChangeVisibility,
      disabled,
      onUpdateList,
      isPro,
      isListOwner,
      listId,
    } = this.props
    const { activeTab } = this.state

    if (!isListOwner) return null

    return (
      <div>
        <div className={[_s.d, _s.borderTop1PX, _s.borderColorSecondary].join(' ')}>
          <div className={[_s.d, _s.z4, _s.bgPrimary, _s.px15, _s.top0, _s.posSticky, _s.borderBottom1PX, _s.borderColorSecondary,].join(' ')}>
            <TabBar
              tabs={[
                {
                  title: 'Settings',
                  onClick: () => this.handleChangeTab('settings'),
                  active: activeTab === 'settings',
                },
                {
                  title: 'Add New Members',
                  onClick: () => this.handleChangeTab('add-new'),
                  active: activeTab === 'add-new',
                },
                {
                  title: 'Remove Members',
                  onClick: () => this.handleChangeTab('remove-members'),
                  active: activeTab === 'remove-members',
                },
              ]}
            />
          </div>

          {
            activeTab === 'settings' &&
            <div className={[_s.d, _s.mb10, _s.pb10, _s.px15].join(' ')}>
              <div className={[_s.d, _s.py15].join(' ')}>
                <Input
                  title='Edit feed title'
                  placeholder='My new feed title...'
                  value={title}
                  onChange={onChangeTitle}
                  disabled={disabled}
                />
              </div>
              
              {
                isPro && isStaff &&
                <div className={[_s.d, _s.py15].join(' ')}>
                  <Input
                    title='Slug (staff only)'
                    placeholder=''
                    value={slug}
                    onChange={onChangeSlug}
                  />
                </div>
              }

              <div className={[_s.d, _s.mb10, _s.py5, _s.ml15].join(' ')}>
                <Text
                  htmlFor='list-visibility'
                  size='small'
                  weight='medium'
                  color='secondary'
                  tagName='label'
                >
                  Visibility
                </Text>
                <Text color='secondary' size='small' className={_s.pt10}>
                  By default, feeds are private and only you can see who is on a feed. No one else can view your feeds. No one knows that they are on your feed.
                </Text>
                <Text color='secondary' size='small' className={_s.pt5}>
                  If you want your feed to be public, then people will be able to subscribe to your feed, share your feed and see who is on your feed.
                </Text>
                <Text color='secondary' size='small' className={_s.pt5}>
                  * Note: If you have a public feed then change it to private, all existing feed subscribers will be removed.
                </Text>
              </div>

              <div className={[_s.d, _s.mb15].join(' ')}>
                <Select
                  id='list-visibility'
                  value={visibility}
                  onChange={onChangeVisibility}
                  options={[
                    {
                      value: 'private',
                      title: 'Private'
                    },
                    {
                      value: 'public',
                      title: 'Public',
                    },
                  ]}
                />

                <Button
                  onClick={onUpdateList}
                  isDisabled={disabled}
                  className={[_s.mt15].join(' ')}
                >
                  <Text color='inherit' align='center'>
                    Save Changes
                  </Text>
                </Button>
              </div>

              <Divider />

              <div className={[_s.d, _s.mb10, _s.mt10].join(' ')}>
                <Button
                  onClick={this.handleOnDeleteList}
                  backgroundColor='danger'
                >
                  <Text color='inherit' align='center'>
                    Delete Feed
                  </Text>
                </Button>
              </div>
              <Text size='extraSmall' color='secondary'>
                Once you delete a feed you cannot retrieve it.
              </Text>
            </div>
          }

          {
            activeTab === 'add-new' &&
            <div className={[_s.d, _s.mb10, _s.py10].join(' ')}>
              <div className={[_s.d, _s.px15].join(' ')}>
                <Input
                  placeholder={intl.formatMessage(messages.search)}
                  value={searchSuggestionsValue}
                  onChange={this.handleSearchSuggestionsChange}
                  onKeyUp={this.handleSearchSuggestionsKeyUp}
                  handleSubmit={this.handleSearchSuggestionsSubmit}
                  title={intl.formatMessage(messages.searchTitle)}
                  autocomplete='off'
                  prependIcon='search'
                  hideLabel
                />
              </div>

              <div className={[_s.d, _s.pt10].join(' ')}>
                <div className={[_s.d].join(' ')}>
                  <Text weight='bold' size='small' color='secondary' className={[_s.d, _s.px15, _s.mt5, _s.mb15].join(' ')}>
                    Search results ({searchAccountIds.size})
                  </Text>
                  {
                    searchAccountIds &&
                    searchAccountIds.map((accountId) => {
                      // if (searchAccountIds.includes(accountId)) return null
                      return (
                        <Account
                          key={`add-to-list-${accountId}`}
                          id={accountId}
                          compact
                          onActionClick={() => this.handleOnAddAccountToList(accountId)}
                          actionIcon='add'
                          noClick
                        />
                      )
                    })
                  }
                </div>
              </div>
            </div>
          }

          {
            activeTab === 'remove-members' &&
            <ListMembers listId={listId} />
          }

        </div>
      </div>
    )

  }

}

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  save: { id: 'lists.new.save_title', defaultMessage: 'Save Title' },
  changeTitle: { id: 'lists.edit.submit', defaultMessage: 'Change title' },
  addToList: { id: 'lists.account.add', defaultMessage: 'Add to list' },
  removeFromList: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  editList: { id: 'lists.edit', defaultMessage: 'Edit list' },
  editListTitle: { id: 'lists.new.edit_title_placeholder', defaultMessage: 'Edit list title' },
  remove: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  add: { id: 'lists.account.add', defaultMessage: 'Add to list' },
  search: { id: 'lists.search', defaultMessage: 'Search people...' },
  searchMembers: { id: 'lists.search_members', defaultMessage: 'Search members...' },
  searchTitle: { id: 'tabs_bar.search', defaultMessage: 'Search' },
})

const mapStateToProps = (state, { params, id }) => {
  const listId = isObject(params) ? params['id'] : id

	return {
    listId,
    list: state.getIn(['lists', 'items', listId]),
    title: state.getIn(['list_editor', 'title']),
    slug: state.getIn(['list_editor', 'slug']),
    visibility: state.getIn(['list_editor', 'visibility']),
    disabled: !state.getIn(['list_editor', 'isChanged']),
    searchAccountIds: state.getIn(['list_editor', 'suggestions', 'items']),
    searchSuggestionsValue: state.getIn(['list_editor', 'suggestions', 'value']),
    isListOwner: state.getIn(['lists', 'items', listId, 'account', 'id'], null) === me,
    isPro: state.getIn(['accounts', me, 'is_pro']),
  }
}

const mapDispatchToProps = (dispatch) => ({
  onDeleteList(list) {
    dispatch(openModal(MODAL_LIST_DELETE, { list }))
  },
  onChangeTitle(value) {
    dispatch(changeListEditorTitle(value))
  },
  onChangeSlug(value) {
    dispatch(changeListEditorSlug(value))
  },
  onChangeVisibility(e) {
    dispatch(changeListEditorVisibility(e.target.value))
  },
  onUpdateList() {
    dispatch(submitListEditor(false))
    dispatch(closeModal())
  },
  onInitialize(listId) {
    dispatch(setupListEditor(listId))
  },
  onReset() {
    dispatch(resetListEditor())
  },
  onAddAccountToList(accountId) {
    dispatch(addToListEditor(accountId))
  },
  onSubmitSearchSuggestions(value) {
    dispatch(fetchListSuggestions(value))
  },
  onClearSearchSuggestions() {
    dispatch(clearListSuggestions())
  },
  onChangeSuggestions(value) {
    dispatch(changeListSuggestions(value))
  },
})

ListEdit.propTypes = {
  list: ImmutablePropTypes.map,
  title: PropTypes.string,
  visibility: PropTypes.string,
  listId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  onInitialize: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  searchSuggestionsValue: PropTypes.string.isRequired,
  searchAccountIds: ImmutablePropTypes.list.isRequired,
  onRemoveAccountFromList: PropTypes.func.isRequired,
  onAddAccountToList: PropTypes.func.isRequired,
  onChangeSuggestions: PropTypes.func.isRequired,
  onClearSearchSuggestions: PropTypes.func.isRequired,
  onSubmitSearchSuggestions: PropTypes.func.isRequired,
  onDeleteList: PropTypes.func.isRequired,
  onChangeVisibility: PropTypes.func.isRequired,
  tab: PropTypes.string,
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ListEdit))
