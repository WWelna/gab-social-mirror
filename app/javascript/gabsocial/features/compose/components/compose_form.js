import React from 'react'
import PropTypes from 'prop-types'
import { defineMessages, injectIntl } from 'react-intl'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {
  Map as ImmutableMap,
  List as ImmutableList,
  OrderedSet as ImmutableOrderedSet
} from 'immutable'
import { length } from 'stringz'
import { connect } from 'react-redux'
import { supportsPassiveEvents } from 'detect-it'
import { CancelToken, isCancel } from 'axios'
import get from 'lodash/get'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'
import { countableText } from '../../ui/util/counter'
import {
  CX,
  MAX_POST_CHARACTER_COUNT,
  BREAKPOINT_EXTRA_SMALL,
  COMPOSE_MAX_MEDIA_ATTACHMENTS_LIMIT,
  TOAST_TYPE_SUCCESS,
  TOAST_TYPE_ERROR,
  MODAL_UNAUTHORIZED
} from '../../../constants'
import AutosuggestTextbox from '../../../components/autosuggest_textbox'
import PollForm from './poll_form'
import StatusContainer from '../../../containers/status_container'
import UploadForm from './upload_form'
import Input from '../../../components/input'
import ComposeDestinationHeader from './compose_destination_header'
import ComposeFormSubmitButton from './compose_form_submit_button'
import {
  accountId,
  default_status_expiration,
  default_privacy,
  default_sensitive,
  isStaff,
  isPro,
  loggedOut
} from '../../../initial_state'
import api from '../../../api'
import {
  importFetchedAccounts,
  importFetchedStatuses,
} from '../../../actions/importer'
import { closeModal, openModal } from '../../../actions/modal'
import { showToast } from '../../../actions/toasts'
import { fetchStatusStats, fetchCommentsSuccess, fetchConversationOwner } from '../../../actions/statuses'
import reduxStore from '../../../store'
import { timelinePrependItem, timelineQueue } from '../../../store/timelines'
import UploadButton from './media_upload_button'
import EmojiPickerButton from './emoji_picker_button'
import PollButton from './poll_button'
import StatusVisibilityButton from './status_visibility_button'
import SpoilerButton from './spoiler_button'
import SchedulePostButton from './schedule_post_button'
import ExpiresPostButton from './expires_post_button'
import RichTextEditorButton from './rich_text_editor_button'
import { dispatchWindowEvent } from '../../../utils/events'
import { search as emojiSearch } from '../../../components/emoji/emoji_mart_search_light'
import uuid from '../../../utils/uuid'
import UploadArea from '../../../components/upload_area'
import { parseQuerystring } from '../../../utils/querystring'
import { urlRegex } from '../../ui/util/url_regex'

const evtOpts = supportsPassiveEvents ? { passive: true } : false

const messages = defineMessages({
  placeholder: {
    id: 'compose_form.placeholder',
    defaultMessage: "What's on your mind?"
  },
  commentPlaceholder: {
    id: 'compose_form.comment_placeholder',
    defaultMessage: 'Write a comment...'
  },
  spoiler_placeholder: {
    id: 'compose_form.spoiler_placeholder',
    defaultMessage: 'Write your warning here'
  },
  post: { id: 'compose_form.post', defaultMessage: 'Post' },
  postEdit: { id: 'compose_form.post_edit', defaultMessage: 'Post Edit' },
  schedulePost: {
    id: 'compose_form.schedule_post',
    defaultMessage: 'Schedule Post'
  }
})

const { isMap } = ImmutableMap
const { isList } = ImmutableList

const isString = val => typeof val === 'string'
const hasCharacters = val => isString(val) && val.length > 0
const hasItems = arr => Array.isArray(arr) && arr.length > 0

const initialStateDefaults = {
  id: null,
  in_reply_to: null,
  group_id: null,
  quote_of_id: null,
  mounted: 0,
  sensitive: Boolean(default_sensitive),
  spoiler: false,
  spoiler_text: '',
  privacy: default_privacy || 'public',
  text: '',
  markdown: null,
  media_attachments: [],
  media_ids: [],
  poll: null,
  suggestions: [],
  resetFileKey: uuid(),
  scheduled_at: null,
  expires_at: default_status_expiration || null,
  rte_controls_visible: false,
  cursorPosition: 0,
  isSubmitting: false,
  isUploading: false,
  anyMedia: false,
  uploadProgress: 0,
  firstFocusText: null,
  selectedStatusContextId: null,
}

const initialPoll = { options: ['', ''], expires_in: 86400 }

function formatServerAttachment({
  id,
  description,
  file_content_type: type,
  url,
  preview_url,
}) {
  return { id, description, type, url, preview_url }
}

// arguments override the defaults
function createInitialState({
  in_reply_to,
  group_id,
  quoteStatus,
  editStatus,
  replyStatus,
  replyAccount,
  mentionAccount,
  initialText,
  isModal
}) {
  const overrides = {}
  const isEdit = isMap(editStatus)
  const isQuote = isMap(quoteStatus)
  const isReply = isMap(replyStatus)
  let mentions = new ImmutableOrderedSet([])
  let text
  let textInjectKey = 'text'

  if (group_id) {
    overrides.group_id = group_id
  }

  if (isQuote) {
    overrides.quote_of_id = quoteStatus.get('id')
  }

  if (isReply) {
    overrides.in_reply_to = replyStatus.get('id')
    const account = replyStatus.get('account')
    if (isMap(account) && account.get('id') !== accountId) {
      mentions = mentions.add(account)
    }
    mentions = mentions.union(
      replyStatus
        .get('mentions')
        .filterNot(mention => mention.get('id') === accountId)
    )
    textInjectKey = 'firstFocusText'
  }

  if (isMap(replyAccount) && replyAccount.get('id') !== accountId) {
    mentions = mentions.add(replyAccount)
    textInjectKey = 'firstFocusText'
  }

  if (in_reply_to) {
    overrides.in_reply_to = in_reply_to
  }

  /*
  
  Import and map what is from the API to what is in the client for editing.
  
  */
  if (isEdit) {
    const original = editStatus.toJS()
    const keyMap = {
      in_reply_to_id: 'in_reply_to',
      visibility: 'privacy'
    }
    
    if (!!original.status_context) {
      overrides.selectedStatusContextId = original.status_context.id
    }

    // if these come from the server override with it
    ;[
      'id',
      'text',
      'markdown',
      'media_attachments',
      'expires_at',
      'sensitive',
      'spoiler_text',
      'visibility',
      'in_reply_to_id',
      'quote_of_id',
    ].forEach(function (key) {
      const val = original[key]
      if (
        val !== undefined &&
        val !== null &&
        val !== initialStateDefaults[key]
      ) {
        const fixedKey = keyMap[key] || key
        overrides[fixedKey] = val
      }
    })

    // show the spoiler if there is text from the server
    if (hasCharacters(overrides.spoiler_text)) {
      overrides.spoiler = true
    }

    // format server attachments so they mirror client attachments
    if (hasItems(overrides.media_attachments)) {
      overrides.media_attachments = overrides.media_attachments.map(
        formatServerAttachment
      )
      overrides.media_ids = overrides.media_attachments.map(({ id }) => id)
      overrides.anyMedia = true
    }

    if (overrides.markdown) {
      overrides.rte_controls_visible = true
    }

    if (original.group && original.group.id) {
      overrides.group_id = original.group.id
    }
  } else if (typeof initialText === 'string' && initialText.length > 0) {
    text = initialText
  } else if (isMap(mentionAccount) && mentionAccount.get('id') !== accountId) {
    mentions = mentions.add(mentionAccount)
  }

  if (mentions.size > 0) {
    const mentionsText = mentions
      .map(mention => mention.get('username'))
      .map(username => `@${username}`)
      .join(' ')
    if (isModal) {
      textInjectKey = 'text'
    }
    overrides[textInjectKey] = mentionsText + ' '
  } else if (typeof text === 'string') {
    overrides.text = text
  }

  return Object.assign({}, initialStateDefaults, overrides)
}

/**
 * When a user posts a status try to inject it in the timelines if relevant.
 * @method timelineInjectLive
 * @param {ImmutableMap} options.timelines
 * @param {string} options.groupId
 * @param {object} options.data response from posting status
 */
function timelineInjectLive({ data }) {
  const { id: statusId, group } = data
  const group_id = group && group.id
  const hasGroup =
    (typeof group_id === 'string' && group_id.length > 0) ||
    typeof group_id === 'number'
  const { pathname } = window.location
  const state = reduxStore.getState()
  const timelineSort = timelineId =>
    state.getIn(['timelines', timelineId, 'sortByValue'])
  function prepend(timelineId) {
    if (window.scrollY > 400) {
      // when scrolled down queue the item and prevent scroll jumps
      reduxStore.dispatch(timelineQueue(timelineId, [statusId]))
      return
    }
    // scrolled to the top inject it into the timeline visible
    reduxStore.dispatch(timelinePrependItem(timelineId, statusId))
  }
  const newSorts = [null, 'newest', 'no-reposts']
  const deckConfig = state.getIn(['settings', 'gabDeckOrder'])
  const deckHasHome =
    isPro &&
    isList(deckConfig) &&
    deckConfig.some(item => {
      return item === 'home'
    })
  const deckGrouo =
    hasGroup &&
    isPro &&
    isList(deckConfig) &&
    deckConfig.some(item => {
      return item === `group.${group_id}`
    })

  let timelineId

  if (
    (pathname.startsWith('/home') || (pathname === '/deck' && deckHasHome)) &&
    newSorts.includes(timelineSort('home'))
  ) {
    // --> on home screen posting to home timeline or group
    prepend('home')
  }

  if (
    (pathname.startsWith('/groups/') || (pathname === '/deck' && deckGrouo)) &&
    hasGroup &&
    newSorts.includes(timelineSort(`group:${group_id}`))
  ) {
    // --> on group screen posting into group timeline
    prepend(`group:${group_id}`)
  }

  if (
    pathname === '/groups' &&
    hasGroup &&
    newSorts.includes(timelineSort('group_collection:member'))
  ) {
    // --> on /groups member groups timeline
    prepend('group_collection:member')
  }

  if (pathname === '/timeline/pro' && isPro && !group_id) {
    // --> pro feed
    prepend('pro')
  }
}

/**
 * The server needs the links to have a protocol in order to make the anchors
 * in the HTML it makes. `urlRegex` is a very long and sophisticated function
 * for searching for these.
 * @method clientServerUrlHelper
 * @param {text} options.text
 * @param {text} [options.markdown]
 * @returns {object} text, markdown
 */
function clientServerUrlHelper({ text, markdown }) {
  function replacer(val) {
    const hasProtocol = val.startsWith('https://') || val.startsWith('http://')
    // Make sure not a remote mention like @someone@somewhere.com
    if (!hasProtocol) {
      if (text.indexOf(`@${val}`) > -1) {
        return val
      }
    }
    return hasProtocol ? val : `http://${val}`
  }

  return {
    text: text.replace(urlRegex, replacer),
    markdown:
      typeof markdown === 'string' ? markdown.replace(urlRegex, replacer) : null
  }
}

class ComposeForm extends React.Component {
  state = createInitialState({
    in_reply_to: this.props.replyToId,
    group_id: this.props.groupId,
    quoteStatus: this.props.quoteStatus, // from the modal and/or popover
    editStatus: this.props.editStatus,
    replyStatus: this.props.replyStatus,
    replyAccount: this.props.replyAccount,
    mentionAccount: this.props.mentionAccount,
    initialText: this.props.initialText,
    isModal: this.props.isModal
  })

  componentDidMount() {
    document.addEventListener('click', this.handleClick, evtOpts)
    this.contentChange()
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick)
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.groupId !== this.props.groupId ||
      prevProps.isMember !== this.props.isMember
    ) {
      if (this.props.groupId && this.props.isMember) {
        // the group and relationships are not always known at mount
        this.setState({ group_id: this.props.groupId })
      }
    }
  }

  contentChange = () => {
    if (typeof this.props.onContentUpdated === 'function') {
      // we need to update the modal
      const { text, markdown, media_attachments } = this.state
      this.props.onContentUpdated({ text, markdown, media_attachments })
    }
  }

  onTextboxChange = change => {
    this.setState(change)
    this.contentChange()
  }

  handleKeyDown = e => {
    if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
      this.handleSubmit()
    }
  }

  handleClick = evt => {
    const { target } = evt
    if (!this.form) return false

    if (
      target &&
      target.classList.contains('react-datepicker__time-list-item')
    ) {
      return false
    }
  }

  get submittableTextLength() {
    return length(this.state.spoiler_text + countableText(this.state.text))
  }

  get isDisabled() {
    const { isSubmitting, isUploading, text, markdown, anyMedia } = this.state
    const { submittableTextLength } = this
    return (
      isSubmitting ||
      isUploading ||
      submittableTextLength > MAX_POST_CHARACTER_COUNT ||
      (!text && !markdown && !anyMedia)
    )
  }

  mapStateToForm = ({ media_ids }) => {
    // urls need a protocol on the server so it can make the links
    let { text, markdown } = clientServerUrlHelper(this.state)

    const {
      expires_at,
      scheduled_at,
      in_reply_to: in_reply_to_id,
      quote_of_id,
      sensitive,
      spoiler_text,
      privacy: visibility,
      poll,
      group_id,
      selectedStatusContextId,
    } = this.state

    const { autoJoinGroup } = this.props

    return {
      status: text,
      markdown,
      expires_at,
      scheduled_at,
      autoJoinGroup,
      in_reply_to_id,
      quote_of_id,
      sensitive,
      spoiler_text,
      visibility,
      poll,
      group_id,
      media_ids,
      status_context_id: selectedStatusContextId,
    }
  }

  /**
   * Post the status content to the API and then integrate the content into
   * redux memory.
   * @method onSubmit
   */
  onSubmit = () => {
    if (this.isDisabled) {
      return
    }

    if (loggedOut) {
      return this.props.loginSignupPrompt()
    }

    this.updateAttachments()
    this.setState({ isSubmitting: true })

    const vm = this
    const { id, media_ids } = vm.state
    const isEdit = id !== null
    const {
      isModal,
      onCloseModal,
      onToastSaved,
      onToastEditSaved,
      onSubmitError
    } = vm.props
    const method = isEdit ? 'put' : 'post'
    const endpoint = isEdit ? `/api/v1/statuses/${id}` : '/api/v1/statuses'
    const successToast = isEdit ? onToastEditSaved : onToastSaved

    /**
     * POST or PUT to the API
     * @method uploadStatus
     * @param {function} resolve
     * @param {function} reject
     */
    function uploadStatus(resolve, reject) {
      const dataForm = vm.mapStateToForm({ media_ids })
      api()
        [method](endpoint, dataForm)
        .then(resolve)
        .catch(function (err) {
          console.error('error uploading form', err)
          reject(err)
        })
    }

    /**
     * Called when the API request succeeeds. The state is reset and the
     * content gets integrated into redux.
     * @method submitSuccess
     */
    function submitSuccess({ data }) {
      if (!data.scheduled_at) {
        vm.props.onImport(data)
        if (!isEdit) {
          timelineInjectLive({ data })
        }
        if (data.in_reply_to_id) {
          vm.props.onFetchStatusStats(data.in_reply_to_id, [data])
        }
      }
      const group_id = vm.props.isMember ? vm.props.groupId : null
      vm.setState(
        createInitialState({
          group_id,
          in_reply_to: vm.props.replyToId,
          replyStatus: vm.props.replyStatus,
          replyAccount: vm.props.replyAccount,
          mentionAccount: vm.props.mentionAccount,
          isModal: vm.props.isModal
        })
      )
      vm.firstFocused = false
      const { composerId } = vm.props
      dispatchWindowEvent('composer-reset', { composerId })
      if (isModal) {
        onCloseModal()
      }
      successToast()

      const { then } = parseQuerystring({ then: '/home' })
      if (
        typeof then === 'string' &&
        then.length > 0 &&
        // in our site
        then.startsWith('/') &&
        // and not same proto url //some-other-site.net
        then.startsWith('//') === false &&
        // /compose or /groups/1/compose
        window.location.pathname.includes('/compose')
      ) {
        window.location.href = then
      }
    }

    function submitFail(err) {
      console.error('error in submit steps', err)
      onSubmitError(err)
    }

    function enable() {
      vm.setState({ isSubmitting: false, isUploading: false })
    }

    new Promise(uploadStatus)
      .then(submitSuccess)
      .catch(submitFail)
      .finally(enable)

    if (media_ids.length > 0) {
      this.updateAttachmentDescriptions().catch(function (err) {
        const { message, stack } = err
        console.error('error updating attachment descriptions', message, stack)
      })
    }
  }

  cancelSuggestionRequest = () => {
    if (typeof this.cancel === 'function') {
      try {
        this.cancel()
      } catch (cancelErr) {
        const { message, stack } = cancelErr
        console.error('error canceling search', message, stack)
      }
    }
    this.cancel = null
  }

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] })
    this.cancelSuggestionRequest()
  }

  accountsSuggestions = token => {
    if (token.length === 0 || loggedOut) {
      return
    }
    this.cancelSuggestionRequest()
    api()
      .get('/api/v1/accounts/search', {
        // TODO when upgrade axios replace with AbortController
        cancelToken: new CancelToken(c => (this.cancel = c)),
        params: {
          q: token.slice(1),
          resolve: false,
          limit: 4
        }
      })
      .then(({ data: accounts }) => {
        delete this.cancel
        accounts.checkpoint = Math.random() // make it re-render
        if (accounts.length > 0) {
          this.props.importFetchedAccounts(accounts)
        }
        this.setState({ suggestions: accounts })
      })
      .catch(function (searchErr) {
        if (isCancel(searchErr)) {
          return console.warn('canceled search')
        }
        const { message, stack } = searchErr
        console.error('error fetching username suggestions', message, stack)
        this.setState({ suggestions: [] })
      })
  }

  emojiSuggestions = token => {
    const suggestions = emojiSearch(token.replace(/:/g, ''), { maxResults: 5 })
    suggestions.checkpoint = Math.random()
    this.setState({ suggestions })
  }

  onSuggestionsFetchRequested = token => {
    if (token.startsWith(':')) {
      this.emojiSuggestions(token)
    } else if (token.startsWith('#')) {
      // tags
    } else if (token.startsWith('@')) {
      this.accountsSuggestions(token)
    }
  }

  onSuggestionSelected = ({ tokenStart, token, suggestion }) => {
    const { composerId } = this.props
    const username = suggestion.acct || suggestion.username
    const emoji = suggestion.native || suggestion.colons
    const start = tokenStart - 1
    const end = start + token.length
    let text
    if (typeof username === 'string') {
      text = `@${username} `
    } else if (emoji) {
      text = `${emoji} `
    }
    if (text !== undefined) {
      dispatchWindowEvent('composer-replace', { composerId, start, end, text })
    }
    this.onSuggestionsClearRequested()
  }

  onSpoilerText = spoiler_text => this.setState({ spoiler_text })

  setAutosuggestTextarea = ref => (this.autosuggestTextarea = ref)

  setForm = ref => (this.form = ref)
  setOuterRef = ref => (this.outerRef = ref)

  // paste comes in from draftjs or textarea
  onPaste = evt => {
    if (evt && evt.length > 0) {
      return this.onUpload(evt) // from draftjs paste files
    }

    const files = get(evt, 'clipboardData.files')
    if (files && files.length > 0) {
      this.onUpload(files)
    }
  }

  updateAttachment = (file, opts) => {
    const newAttachments = [].concat(this.state.media_attachments)
    const index = newAttachments.indexOf(file)
    if (index !== -1) {
      newAttachments[index] = Object.assign(newAttachments[index], opts)
    } else {
      console.warn('cannot find attachment by index', file, index)
    }
    this.setState({ media_attachments: newAttachments })
  }

  updateMediaIds = () => {
    const media_ids = [].concat(
      this.state.media_attachments
        .filter(file => file.id !== undefined)
        .map(file => file.id)
    )
    this.setState({ media_ids })
  }

  updateAttachmentDescriptions = () => {
    const { media_attachments } = this.state
    const updateDescription = file => resolve =>
      api()
        .put(`/api/v1/media/${file.id}`, {
          description: file.description || null
        })
        .then(() => resolve())
        .catch(function (err) {
          const { message, stack } = err
          console.error('error upating description', file, message, stack)
          resolve()
        })
    return Promise.all(
      media_attachments
        .filter(file => file.id !== undefined)
        .map(file => new Promise(updateDescription(file)))
    )
  }

  updateAttachments = () => {
    const vm = this
    const { media_attachments } = vm.state

    // size of files not yet uploaded
    const totalBytes = media_attachments
      .filter(file => file.id === undefined && file.uploading !== true)
      .reduce((acm, file) => acm + (file.size || 0), 0)

    const uploadedBytes = []

    function updateProgressBar() {
      const transferred = uploadedBytes.reduce((acm, size = 0) => acm + size, 0)
      const uploadProgress = (transferred / totalBytes) * 100
      vm.setState({ uploadProgress })
    }

    vm.setState({ isUploading: true, uploadProgress: 0 })

    const uploadAttachment = (file, fileIndex) =>
      function uploadAttachmentInner(resolve, reject) {
        if (file.id || file.uploading) {
          return resolve()
        }

        vm.updateAttachment(file, { uploading: true })

        const mediaForm = new FormData()
        mediaForm.append('file', file)
        const axiosOptions = {
          onUploadProgress({ loaded }) {
            uploadedBytes[fileIndex] = loaded
            vm.updateAttachment(file, { bytesUploaded: loaded })
            updateProgressBar()
          }
        }

        api()
          .post('/api/v1/media', mediaForm, axiosOptions)
          .then(function (res) {
            const { id, preview_url, url, blurhash } = res.data
            file.id = id
            vm.updateAttachment(file, {
              uploading: false,
              id,
              preview_url,
              url,
              blurhash,
              error: null
            })
            resolve()
          })
          .catch(function (err) {
            console.error('error uploading file', file, fileIndex, err)
            vm.props.onUploadError(err, file)
            const code =
              err.status ||
              err.statusCode ||
              get(err, 'response.status') ||
              err.code
            let message = `error uploading file '${file.name}'`
            const serverMessage = get(err, 'response.data.error')
            if (typeof serverMessage === 'string') {
              message = `${message}, message: ${serverMessage}`
            }
            if (file.type) {
              message = `${message}, type: ${file.type}`
            }
            if (code !== undefined) {
              message = `${message}, code: ${code}`
            }
            vm.updateAttachment(file, {
              uploading: false,
              error: message
            })
            reject(err)
          })
      }

    Promise.all(
      media_attachments.map(
        (file, fileIndex) => new Promise(uploadAttachment(file, fileIndex))
      )
    )
      .then(function () {
        vm.setState({ isUploading: false })
        vm.updateMediaIds()
      })
      .catch(function (err) {
        const { message, stack } = err
        console.error('error uploading files', message, stack)
        vm.setState({ isUploading: false })
        vm.updateMediaIds()
      })
  }

  /**
   * When one or more files are added to the composer.
   * @param {FileList} files
   */
  onUpload = files => {
    if (loggedOut) {
      return
    }

    // create a new array or the UI wont update
    const newAttachments = [].concat(this.state.media_attachments)
    Array.from(files).forEach(function (file) {
      if (file.size === 0) {
        return console.warn('file size zero', file)
      }
      const found = newAttachments.some(
        item =>
          item.name === file.name &&
          item.size === file.size &&
          item.type === file.type
      )
      if (found === false && newAttachments.length < COMPOSE_MAX_MEDIA_ATTACHMENTS_LIMIT) {
        file.description = ''
        newAttachments.push(file)
      } else {
        console.warn('skipping file we already have', file)
      }
    })
    const anyMedia = newAttachments.length > 0
    this.setState({
      resetFileKey: uuid(),
      media_attachments: newAttachments,
      anyMedia
    })
    this.contentChange()

    // wait for state updates to finish
    setTimeout(() => this.updateAttachments(), 30)
  }

  onFileChange = (changeIndex, description) => {
    const newAttachments = []
      .concat(this.state.media_attachments)
      .map(function (file, itemIndex) {
        if (itemIndex === changeIndex) {
          file.description = description
        }
        return file
      })
    this.setState({ media_attachments: newAttachments })
    // wait for state updates to finish
    setTimeout(() => this.updateAttachments(), 30)
  }

  onFileRemove = removeIndex => {
    const newAttachments = []
      .concat(this.state.media_attachments)
      .filter((_, itemIndex) => removeIndex !== itemIndex)
    const anyMedia = newAttachments.length > 0
    this.setState({ media_attachments: newAttachments, anyMedia })

    // wait for state updates to finish
    setTimeout(() => this.updateMediaIds(), 30)
  }

  onVisibility = privacy => this.setState({ privacy })

  /**
   * Set expire or remove expire call it so it can be a date|string or
   * DOM event.
   * @param {object|string|date} evt
   */
  onSchedule = evt => {
    const scheduled_at = evt.target && evt.type ? null : evt
    this.setState({ scheduled_at })
  }

  onExpires = expires_at => this.setState({ expires_at })

  onSpoiler = () => {
    let spoiler = !this.state.spoiler
    let spoiler_text = spoiler ? this.state.spoiler_text : ''
    this.setState({ spoiler, spoiler_text })
  }

  onPollToggle = () =>
    this.setState({ poll: this.state.poll === null ? initialPoll : null })

  onPollChange = poll => this.setState({ poll })

  onStatusContextChange = (selectedStatusContextId) => {
    this.setState({ selectedStatusContextId })
  }

  onDestination = evt => {
    const group_id = evt.groupId
    this.setState({ group_id })
    const { pathname, search } = this.props.location
    const defaultRedirect = '/home'
    const parsed = parseQuerystring({ then: defaultRedirect })
    const redirect = group_id ? `/groups/${group_id}` : defaultRedirect
    if (pathname.includes('/compose') && parsed.then !== redirect) {
      // carry text, url, or whatever other querystrings we have
      const qs = queryString.stringify(
        Object.assign({}, parsed, { then: redirect })
      )
      this.props.history.push(`${pathname}?${qs}`)
    }
  }

  onSensitive = () => this.setState({ sensitive: !this.state.sensitive })

  onRichTextToggle = () =>
    this.setState({ rte_controls_visible: !this.state.rte_controls_visible })

  firstFocused = false

  onFocus = evt => {
    const { composerId } = this.props
    const { firstFocusText } = this.state
    if (typeof firstFocusText === 'string' && !this.firstFocused) {
      setTimeout(function () {
        dispatchWindowEvent('composer-insert', {
          composerId,
          text: firstFocusText
        })
      }, 50)
      this.firstFocused = true
    }
  }

  render() {
    const { isDisabled, submittableTextLength } = this

    const {
      id, // editing status id
      text,
      markdown,
      suggestions,
      isSubmitting,
      cursorPosition,
      spoiler,
      spoiler_text,
      isUploading,
      anyMedia,
      in_reply_to,
      quote_of_id,
      poll,
      resetFileKey,
      privacy,
      media_attachments,
      scheduled_at,
      group_id,
      uploadProgress,
      sensitive,
      rte_controls_visible,
      expires_at,
      selectedStatusContextId,
    } = this.state

    const {
      // from direct props
      intl,
      composerId,
      feature,
      formLocation,
      isModal,
      autoFocus,
      hidePro,
      autoJoinGroup,

      // from redux
      isModalOpen,
      account
    } = this.props

    const isEdit = id !== null
    const isComment = in_reply_to !== null
    const isQuote = quote_of_id !== null
    const hasPoll = poll !== null

    const composerBox = (
      <AutosuggestTextbox
        ref={this.setAutosuggestTextarea}
        placeholder={intl.formatMessage(
          isComment ? messages.commentPlaceholder : messages.placeholder
        )}
        disabled={isSubmitting}
        text={text}
        markdown={markdown}
        onChange={this.onTextboxChange}
        suggestions={suggestions}
        onKeyDown={this.handleKeyDown}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionSelected={this.onSuggestionSelected}
        onPaste={this.onPaste}
        onUpload={this.onUpload}
        onFocus={this.onFocus}
        autoFocus={autoFocus}
        isModalOpen={isModalOpen}
        isEdit={isEdit}
        id={composerId}
        cursorPosition={cursorPosition}
        composerId={composerId}
        rte_controls_visible={rte_controls_visible}
      />
    )

    const outerClasses = CX({
      d: 1,
      bgPrimary: 1,
      radiusSmall: 1,
      overflowHidden: 1,
      boxShadowBlock: !isComment
    })

    const formClasses = CX({
      d: 1,
      calcMaxH410PX: 1,
      minH150PX: isModalOpen,
      overflowYScroll: 1,
      flex1: 1,
      boxShadowBlock: submittableTextLength > 64,
      borderColorSecondary: 1
    })

    const innerClasses = CX({
      d: 1,
      pt5: 1,
      calcMaxH410PX: 1,
      minH200PX: ['standalone', 'modal'].indexOf(formLocation) > -1
    })

    const headerBox = (
      <ComposeDestinationHeader
        formLocation={formLocation}
        account={account}
        isModal={isModal}
        groupId={group_id}
        onDestination={this.onDestination}
        onStatusContextChange={this.onStatusContextChange}
        selectedStatusContextId={selectedStatusContextId}
        isComment={isComment}
        isEdit={isEdit}
        text={text}
      />
    )

    const spoilerBox = spoiler && (
      <div
        className={[
          _s.d,
          _s.px15,
          _s.py10,
          _s.borderBottom1PX,
          _s.borderColorSecondary
        ].join(' ')}
      >
        <Input
          placeholder={intl.formatMessage(messages.spoiler_placeholder)}
          value={spoiler_text}
          onChange={this.onSpoilerText}
          prependIcon="warning"
          maxLength={256}
          id="cw-spoiler-input"
        />
      </div>
    )

    const uploadBox = (isUploading || anyMedia) && (
      <div className={[_s.d, _s.px15, _s.mt5].join(' ')}>
        <div
          className={[_s.d, _s.borderTop1PX, _s.borderColorSecondary].join(' ')}
        />
        <UploadForm
          media_attachments={media_attachments}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onFileChange={this.onFileChange}
          onFileRemove={this.onFileRemove}
          onSensitive={this.onSensitive}
          sensitive={sensitive}
        />
        {/* uploads taking too long */}
      </div>
    )

    const pollBox = !isEdit && hasPoll && (
      <div className={[_s.d, _s.px15, _s.mt5].join(' ')}>
        <PollForm poll={poll} onPollChange={this.onPollChange} />
      </div>
    )

    const replyBox = isComment && isModalOpen && (
      <div className={[_s.d, _s.px15, _s.py10, _s.mt5].join(' ')}>
        <StatusContainer contextType="compose" id={in_reply_to} isChild expanded />
      </div>
    )

    const quoteBox = isQuote && isModalOpen && (
      <div className={[_s.d, _s.px15, _s.py10, _s.mt5].join(' ')}>
        <StatusContainer contextType="compose" id={quote_of_id} isChild expanded />
      </div>
    )

    const submitButton = (isModal || submittableTextLength > 0 || anyMedia) && (
      <div className={[_s.d, _s.mb10, _s.px10].join(' ')}>
        <ComposeFormSubmitButton
          type="block"
          formLocation={formLocation}
          autoJoinGroup={autoJoinGroup}
          disabled={isDisabled}
          isEdit={isEdit}
          onSubmit={this.onSubmit}
          scheduled_at={scheduled_at}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          media_attachments={media_attachments}
        />
      </div>
    )

    const isXS = window.innerWidth <= BREAKPOINT_EXTRA_SMALL
    const isIntroduction = formLocation === 'introduction'
    const small = true

    const composeButtonClasses = CX({
      d: 1,
      w100PC: !feature,
      bgPrimary: 1,
      px5: 1,
      py5: 1,
      borderColorSecondary: 1,
      flexWrap: !feature,
      flexRow: 1,
      // jcSpaceAround: !feature,
      maxW450PX: 1
    })

    const composeButtons = (
      <div className={[_s.d, _s.w100PC, _s.flexGrow1, _s.bgPrimary].join(' ')}>
        <div className={composeButtonClasses}>
          <UploadButton
            resetFileKey={resetFileKey}
            onUpload={this.onUpload}
            disabled={
              isSubmitting || media_attachments.length >= COMPOSE_MAX_MEDIA_ATTACHMENTS_LIMIT
            }
            small={small}
          />
          <EmojiPickerButton
            small={small}
            composerId={composerId}
            disabled={isSubmitting}
          />
          {!isEdit && !isComment && (
            <PollButton
              onPollToggle={this.onPollToggle}
              disabled={isSubmitting}
              small={small}
              poll={poll}
            />
          )}
          {!isIntroduction && (
            <StatusVisibilityButton
              disabled={isSubmitting}
              small={small}
              onVisibility={this.onVisibility}
              privacy={privacy}
            />
          )}
          {!isIntroduction && (
            <SpoilerButton
              disabled={isSubmitting}
              small={small}
              spoiler={spoiler}
              onSpoiler={this.onSpoiler}
            />
          )}
          {!feature && !hidePro && !isEdit && (
            <SchedulePostButton
              composerId={composerId}
              disabled={isSubmitting}
              small={small}
              scheduled_at={scheduled_at}
              onSchedule={this.onSchedule}
            />
          )}
          <ExpiresPostButton
            composerId={composerId}
            disabled={isSubmitting}
            small={small}
            expires_at={expires_at}
            onExpires={this.onExpires}
          />
          {!feature && !isXS && (
            <RichTextEditorButton
              disabled={isSubmitting}
              small={small}
              rte_controls_visible={rte_controls_visible}
              onRichTextToggle={this.onRichTextToggle}
            />
          )}
        </div>
      </div>
    )

    const uploadDragArea = !isXS && (
      <UploadArea
        onUpload={this.onUpload}
        outerRef={this.outerRef}
        isModal={isModal}
        isModalOpen={isModalOpen}
      />
    )

    return (
      <div className={outerClasses} ref={this.setOuterRef}>
        <div className={innerClasses}>
          {headerBox}
          <div
            className={formClasses}
            ref={this.setForm}
            onClick={this.handleClick}
          >
            {spoilerBox}
            {composerBox}
            {uploadBox}
            {pollBox}
            {replyBox}
            {quoteBox}
          </div>
        </div>
        {composeButtons}
        {submitButton}
        {uploadDragArea}
      </div>
    )
  }
}

ComposeForm.propTypes = {
  intl: PropTypes.object,
  composerId: PropTypes.string,
  replyToId: PropTypes.string,
  groupId: PropTypes.string,
  feature: PropTypes.bool,
  formLocation: PropTypes.string,
  isModal: PropTypes.bool,
  autoFocus: PropTypes.bool,
  hidePro: PropTypes.bool,
  autoJoinGroup: PropTypes.bool,

  // setup initial content from <ComposeModal/>
  quoteStatus: ImmutablePropTypes.map,
  editStatus: ImmutablePropTypes.map,
  replyStatus: ImmutablePropTypes.map,
  mentionAccount: ImmutablePropTypes.map,
  initialText: PropTypes.string,
  onContentUpdated: PropTypes.func,
  onFetchStatusStats: PropTypes.func,
}

function mapStateToProps(state, props) {
  const { groupId, replyToId, formLocation } = props
  const modalType = state.getIn(['modal', 'modalType'])
  const modalProps = state.getIn(['modal', 'modalProps'])
  const isModalOpen = modalType === 'COMPOSE' && formLocation === 'modal'
  let { replyStatus } = props
  let replyAccount
  let isMember = false

  if (hasCharacters(replyToId) && !replyStatus) {
    replyStatus = state.getIn(['statuses', replyToId])
    // this is probably a string but we need the account map
    const replyAccountId = replyStatus.get('account')
    if (
      replyStatus &&
      isString(replyAccountId) &&
      replyAccountId !== accountId
    ) {
      // for injecting at-mention, not the user's own account
      replyAccount = state.getIn(['accounts', replyAccountId])
    }
  }

  if (groupId) {
    const {
      member = false,
      admin = false,
      moderator = false
    } = state.getIn(['group_relationships', groupId], ImmutableMap()).toJS()
    isMember = member || moderator || admin || isStaff
  }

  return {
    modalType,
    modalProps,
    isModalOpen,
    account: state.getIn(['accounts', accountId]),
    replyStatus,
    replyAccount,
    isMember
  }
}

const mapDispatchToProps = dispatch => ({
  importFetchedAccounts: accounts => dispatch(importFetchedAccounts(accounts)),
  onCloseModal: () => dispatch(closeModal()),
  onToastSaved: () =>
    dispatch(
      showToast(TOAST_TYPE_SUCCESS, { type: 'status_posted_successfully' })
    ),
  onToastEditSaved: () =>
    dispatch(
      showToast(TOAST_TYPE_SUCCESS, { type: 'status_edited_successfully' })
    ),
  onSubmitError(err) {
    const code =
      err.status ||
      err.statusCode ||
      get(err, 'response.status') ||
      err.code
    let message = '⚠️ error posting status'
    const serverMessage = get(err, 'response.data.error')
    if (typeof serverMessage === 'string') {
      message = `${message}, message: ${serverMessage}`
    } else if (typeof err.message === 'string') {
      message = `${message}, message: ${err.message}`
    }
    if (code !== undefined) {
      message = `${message}, code: ${code}`
    }
    dispatch(showToast(TOAST_TYPE_ERROR, { type: message }))
  },
  onFetchStatusStats(id, data) {
    dispatch(fetchStatusStats(id))
    dispatch(fetchCommentsSuccess(id, data))
    setTimeout(() => { dispatch(fetchConversationOwner(id, data[0].conversation_id, true)) }, 2000)
  },
  onUploadError(err, file) {
    const { message } = err
    const status = err.status || err.statusCode
    let msg = '⚠️ error uploading media'
    if (file && file.name) {
      msg = `${msg}, ${file.name}`
    }
    if (status) {
      msg = `${msg}, ${status}`
    }
    if (message) {
      msg = `${msg}, ${message}`
    }
    dispatch(showToast(TOAST_TYPE_ERROR, { type: msg }))
  },
  onImport: status => dispatch(importFetchedStatuses([status])),
  loginSignupPrompt: () => dispatch(openModal(MODAL_UNAUTHORIZED))
})

export default withRouter(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(ComposeForm))
)
