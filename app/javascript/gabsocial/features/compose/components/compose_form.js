import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { defineMessages, injectIntl } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { length } from 'stringz'
import { isMobile } from '../../../utils/is_mobile'
import { countableText } from '../../ui/util/counter'
import {
  CX,
  MAX_POST_CHARACTER_COUNT,
  BREAKPOINT_EXTRA_SMALL,
  BREAKPOINT_SMALL,
} from '../../../constants'
import AutosuggestTextbox from '../../../components/autosuggest_textbox'
import Responsive from '../../ui/util/responsive_component'
import PollForm from './poll_form'
import StatusContainer from '../../../containers/status_container'
import UploadForm from './upload_form'
import Input from '../../../components/input'
import ComposeExtraButtonList from './compose_extra_button_list'
import ComposeDestinationHeader from './compose_destination_header'
import ComposeFormSubmitButton from './compose_form_submit_button'

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: "What's on your mind?" },
  commentPlaceholder: { id: 'compose_form.comment_placeholder', defaultMessage: "Write a comment..." },
  spoiler_placeholder: { id: 'compose_form.spoiler_placeholder', defaultMessage: 'Write your warning here' },
  post: { id: 'compose_form.post', defaultMessage: 'Post' },
  postEdit: { id: 'compose_form.post_edit', defaultMessage: 'Post Edit' },
  schedulePost: { id: 'compose_form.schedule_post', defaultMessage: 'Schedule Post' },
})

class ComposeForm extends ImmutablePureComponent {

  state = {
    composeFocused: false,
    quote_of_id: null,
    in_reply_to: null,
    group_id: null,
  }

  handleChange = (e, selectionStart) => {
    this.props.onChange(e.target.value, e.target.markdown, this.props.replyToId, selectionStart)
  }

  handleComposeFocus = () => {
    this.setState({ composeFocused: true })
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
      this.handleSubmit()
    }
  }

  handleClick = (e) => {
    const { isModalOpen, shouldCondense } = this.props

    if (!this.form) return false
    if (e.target) {
      if (e.target.classList.contains('react-datepicker__time-list-item')) return false
    }
    if (!this.form.contains(e.target)) {
      this.handleClickOutside()
    }
  }

  handleClickOutside = () => {
    const { shouldCondense, scheduledAt, text, isModalOpen } = this.props
    const condensed = shouldCondense && !text

    if (condensed && scheduledAt && !isModalOpen) { //Reset scheduled date if condensing
      this.props.setScheduledAt(null)
    }

    this.setState({ composeFocused: false })
  }

  handleSubmit = () => {
    // if (this.props.text !== this.autosuggestTextarea.textbox.value) {
    // Something changed the text inside the textarea (e.g. browser extensions like Grammarly)
    // Update the state to match the current text
    // this.props.onChange(this.autosuggestTextarea.textbox.value)
    // }

    // Submit disabled:
    const { isSubmitting, formLocation, isChangingUpload, isUploading, anyMedia, groupId, autoJoinGroup } = this.props
    const fulltext = [this.props.spoilerText, countableText(this.props.text)].join('')
    const isStandalone = formLocation === 'standalone'

    if (isSubmitting || isUploading || isChangingUpload || length(fulltext) > MAX_POST_CHARACTER_COUNT || (fulltext.length !== 0 && fulltext.trim().length === 0 && !anyMedia)) {
      return
    }

    if (this.props.onSubmit === undefined) {
      return // for whatever reason it doesn't get any onSubmit
    }

    this.props.onSubmit({
      history: this.props.history,
      isStandalone,
      autoJoinGroup,
    })
  }

  onSuggestionsClearRequested = () => {
    this.props.onClearSuggestions()
  }

  onSuggestionsFetchRequested = (token) => {
    this.props.onFetchSuggestions(token)
  }

  onSuggestionSelected = (tokenStart, token, value) => {
    this.props.onSuggestionSelected(tokenStart, token, value, ['text'])
  }

  onSpoilerSuggestionSelected = (tokenStart, token, value) => {
    this.props.onSuggestionSelected(tokenStart, token, value, ['spoiler_text'])
  }

  handleChangeSpoilerText = (value) => {
    this.props.onChangeSpoilerText(value)
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClick, false)

    if (this.props.groupId) {
      this.props.onChangeComposeGroupId(this.props.groupId)
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false)
  }

  componentDidUpdate(prevProps) {

    const { groupId } = this.props
    if (prevProps.groupId !== groupId) {
      this.props.onChangeComposeGroupId(groupId)
    }

  }

  setAutosuggestTextarea = (c) => {
    this.autosuggestTextarea = c
  }

  setForm = (c) => {
    this.form = c
  }

  render() {
    const {
      intl,
      autoJoinGroup,
      account,
      onPaste,
      anyMedia,
      shouldCondense,
      autoFocus,
      isModalOpen,
      quoteOfId,
      edit,
      scheduledAt,
      spoiler,
      replyToId,
      reduxReplyToId,
      hasPoll,
      isUploading,
      isMatch,
      isChangingUpload,
      isSubmitting,
      isPro,
      hidePro,
      dontOpenModal,
      formLocation,
      feature,
      groupId,
    } = this.props


    const disabled = isSubmitting
    const text = [this.props.spoilerText, countableText(this.props.text)].join('')
    const disabledButton =  isSubmitting || isUploading || isChangingUpload || length(text) > MAX_POST_CHARACTER_COUNT || (length(text.trim()) === 0 && !anyMedia)
    const shouldAutoFocus = autoFocus && !isMobile(window.innerWidth)

    const textbox = (
      <AutosuggestTextbox
        ref={(isModalOpen && shouldCondense) ? null : this.setAutosuggestTextarea}
        placeholder={intl.formatMessage(replyToId ? messages.commentPlaceholder : messages.placeholder)}
        disabled={disabled}
        value={this.props.text}
        valueMarkdown={this.props.markdown}
        onChange={this.handleChange}
        suggestions={this.props.suggestions}
        onKeyDown={this.handleKeyDown}
        onFocus={this.handleComposeFocus}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionSelected={this.onSuggestionSelected}
        onPaste={onPaste}
        autoFocus={shouldAutoFocus}
        small={shouldCondense}
        isModalOpen={isModalOpen}
        isPro={isPro}
        isEdit={!!edit}
        id='main-composer'
        onUpstreamChangesAccepted={this.props.onUpstreamChangesAccepted}
        hasUpstreamChanges={this.props.hasUpstreamChanges}
        caretPosition={this.props.caretPosition}
      />
    )

    if (shouldCondense) {
      return null
    }

    const containerClasses = CX({
      d: 1,
      calcMaxH410PX: 1,
      minH150PX: isModalOpen && isMatch,
      overflowYScroll: 1,
      flex1: 1,
      boxShadowBlock: length(text) > 64,
      borderColorSecondary: 1,
    })

    const innerClasses = CX({
      d: 1,
      calcMaxH410PX: 1,
      minH200PX: ['standalone', 'modal'].indexOf(formLocation) > -1,
    })

    return (
      <div className={[_s.d, _s.w100PC, _s.flexGrow1, _s.bgPrimary].join(' ')}>
        <div className={innerClasses}>

          {
            !feature &&
            <ComposeDestinationHeader formLocation={formLocation} account={account} isModal={isModalOpen} groupId={groupId}/>
          }

          <div className={containerClasses} ref={this.setForm} onClick={this.handleClick}>

            {
              !!spoiler &&
              <div className={[_s.d, _s.px15, _s.py10, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
                <Input
                  placeholder={intl.formatMessage(messages.spoiler_placeholder)}
                  value={this.props.spoilerText}
                  onChange={this.handleChangeSpoilerText}
                  disabled={!this.props.spoiler}
                  prependIcon='warning'
                  maxLength={256}
                  id='cw-spoiler-input'
                />
              </div>
            }

            { textbox }

            {
              (isUploading || anyMedia) &&
              <div className={[_s.d, _s.px15, _s.mt5].join(' ')}>
                <div className={[_s.d, _s.borderTop1PX, _s.borderColorSecondary].join(' ')} />
                <UploadForm />
              </div>
            }

            {
              !edit && hasPoll &&
              <div className={[_s.d, _s.px15, _s.mt5].join(' ')}>
                <PollForm />
              </div>
            }

            {
              (!!reduxReplyToId || !!quoteOfId) && isModalOpen && isMatch &&
              <div className={[_s.d, _s.px15, _s.py10, _s.mt5].join(' ')}>
                <StatusContainer contextType='compose' id={reduxReplyToId || quoteOfId} isChild />
              </div>
            }
            
          </div>
        </div>
        
        <ComposeExtraButtonList formLocation={formLocation} isMatch={isMatch} hidePro={hidePro} edit={edit} feature={feature} isModal={isModalOpen} />

        {
          (!disabledButton || isModalOpen) && isMatch &&
          <div className={[_s.d, _s.mb10, _s.px10].join(' ')}>
            <ComposeFormSubmitButton
              type='block'
              formLocation={formLocation}
              autoJoinGroup={autoJoinGroup}
            />
          </div>
        }

        <Responsive max={BREAKPOINT_SMALL}>
          {
            formLocation === 'timeline' &&
            <NavLink to='/compose' className={[_s.d, _s.z4, _s.posAbs, _s.top0, _s.left0, _s.right0, _s.bottom0].join(' ')} />
          }
        </Responsive>
      </div>
    )
  }

}

ComposeForm.propTypes = {
  intl: PropTypes.object.isRequired,
  edit: PropTypes.bool,
  isMatch: PropTypes.bool,
  text: PropTypes.string.isRequired,
  markdown: PropTypes.string,
  suggestions: ImmutablePropTypes.list,
  account: ImmutablePropTypes.map.isRequired,
  status: ImmutablePropTypes.map,
  spoiler: PropTypes.bool,
  privacy: PropTypes.string,
  spoilerText: PropTypes.string,
  focusDate: PropTypes.instanceOf(Date),
  caretPosition: PropTypes.number,
  preselectDate: PropTypes.instanceOf(Date),
  isSubmitting: PropTypes.bool,
  isChangingUpload: PropTypes.bool,
  isUploading: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  onClearSuggestions: PropTypes.func.isRequired,
  onFetchSuggestions: PropTypes.func.isRequired,
  onSuggestionSelected: PropTypes.func.isRequired,
  onChangeSpoilerText: PropTypes.func.isRequired,
  onPaste: PropTypes.func.isRequired,
  anyMedia: PropTypes.bool,
  shouldCondense: PropTypes.bool,
  autoFocus: PropTypes.bool,
  groupId: PropTypes.string,
  isModalOpen: PropTypes.bool,
  scheduledAt: PropTypes.instanceOf(Date),
  setScheduledAt: PropTypes.func.isRequired,
  replyToId: PropTypes.string,
  reduxReplyToId: PropTypes.string,
  hasPoll: PropTypes.bool,
  isPro: PropTypes.bool,
  hidePro: PropTypes.bool,
  autoJoinGroup: PropTypes.bool,
  formLocation: PropTypes.string,
  onUpstreamChangesAccepted: PropTypes.func.isRequired,
  hasUpstreamChanges: PropTypes.bool,
}

export default injectIntl(ComposeForm)
