import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import Textarea from 'react-textarea-autosize'
import { CX, BREAKPOINT_EXTRA_SMALL } from '../constants'
import { textAtCursorMatchesToken } from '../utils/cursor_token_match'
import Responsive from '../features/ui/util/responsive_component'
import AutosuggestAccount from './autosuggest_account'
import AutosuggestEmoji from './autosuggest_emoji'
import Composer from './composer'
import Icon from './icon'
import { isMobile, getWindowDimension } from '../utils/is_mobile'

class AutosuggestTextbox extends ImmutablePureComponent {
  state = {
    suggestionsHidden: true,
    selectedSuggestion: 0,
    lastToken: null,
    tokenStart: 0
  }

  get shouldBindComposerEvents() {
    const { width } = getWindowDimension()
    return isMobile(width)
  }

  componentDidMount() {
    if (this.shouldBindComposerEvents) {
      window.addEventListener('composer-insert', this.composerInsert)
      window.addEventListener('composer-replace', this.composerReplace)
      window.addEventListener('composer-reset', this.composerReset)
    }

    if (
      this.props.autoFocus &&
      typeof this.props.text === 'string' &&
      this.props.text.length > 0 &&
      this.textbox
    ) {
      // it has auto focus and text so we want to select to the end
      this.selectEnd()
    }
  }

  componentWillUnmount() {
    if (this.shouldBindComposerEvents) {
      window.removeEventListener('composer-insert', this.composerInsert)
      window.removeEventListener('composer-replace', this.composerReplace)
      window.removeEventListener('composer-reset', this.composerReset)
    }
  }

  componentDidUpdate(prevProps) {
    // in compose_form a new number is set each time it changes
    if (
      Array.isArray(prevProps.suggestions) &&
      Array.isArray(this.props.suggestions) &&
      prevProps.suggestions.checkpoint !== this.props.suggestions
    ) {
      this.setState({ suggestionsHidden: false })
    }
  }

  onChange = ({ text, markdown, cursorPosition }) => {
    const [tokenStart, token] = textAtCursorMatchesToken(text, cursorPosition)

    if (token !== null && this.state.lastToken !== token) {
      this.setState({ lastToken: token, selectedSuggestion: 0, tokenStart })
      this.props.onSuggestionsFetchRequested(token)
    } else if (token === null && this.state.lastToken !== null) {
      this.setState({ lastToken: null })
      this.props.onSuggestionsClearRequested()
    }

    this.props.onChange({ text, markdown, cursorPosition })
  }

  onTextareaChange = evt => {
    const { value: text, selectionStart: cursorPosition } = evt.target
    this.onChange({ text, cursorPosition })
    if (text) {
      window.composerHasText = true
    } else {
      window.composerHasText = false
    }
  }

  onKeyDown = e => {
    const { suggestions, disabled } = this.props
    const { selectedSuggestion, suggestionsHidden } = this.state
    const sugLen = suggestions.length

    if (disabled) {
      e.preventDefault()
      return
    }

    // Ignore key events during text composition
    // e.key may be a name of the physical key even in this case (e.x. Safari / Chrome on Mac)
    if (e.which === 229 || e.isComposing) return

    switch (e.key) {
      case 'Escape':
        if (sugLen === 0 || suggestionsHidden) {
          document.querySelector('#gabsocial').focus()
        } else {
          e.preventDefault()
          this.setState({ suggestionsHidden: true })
        }

        break
      case 'ArrowDown':
        if (sugLen > 0 && !suggestionsHidden) {
          e.preventDefault()
          this.setState({
            selectedSuggestion: Math.min(selectedSuggestion + 1, sugLen - 1)
          })
        }

        break
      case 'ArrowUp':
        if (sugLen > 0 && !suggestionsHidden) {
          e.preventDefault()
          this.setState({
            selectedSuggestion: Math.max(selectedSuggestion - 1, 0)
          })
        }

        break
      case 'Enter':
      case 'Tab':
        // Select suggestion
        if (this.state.lastToken !== null && sugLen > 0 && !suggestionsHidden) {
          e.preventDefault()
          e.stopPropagation()
          const { tokenStart, lastToken: token } = this.state
          const suggestion = suggestions[selectedSuggestion]
          this.props.onSuggestionSelected({ tokenStart, token, suggestion })
        }

        break
    }

    if (e.defaultPrevented || !this.props.onKeyDown) return

    this.props.onKeyDown(e)
  }

  onBlur = () => {
    this.setState({ suggestionsHidden: true })

    if (this.props.onBlur) {
      this.props.onBlur()
    }
  }

  onSuggestionClick = e => {
    const index = parseInt(e.currentTarget.getAttribute('data-index'))
    const suggestion = this.props.suggestions[index]
    e.preventDefault()
    this.props.onSuggestionSelected({
      tokenStart: this.state.tokenStart,
      token: this.state.lastToken,
      suggestion
    })
    this.textbox.focus()
  }

  renderSuggestion = (suggestion, i) => {
    const { selectedSuggestion } = this.state
    const inner =
      suggestion.acct || suggestion.username ? (
        <AutosuggestAccount id={suggestion.id} />
      ) : (
        <AutosuggestEmoji emoji={suggestion} />
      )
    const key = suggestion.id

    const isSelected = i === selectedSuggestion
    const classes = CX({
      bgPrimary: !isSelected,
      bgSubtle: isSelected
    })

    return (
      <div
        role="button"
        key={key}
        data-index={i}
        className={classes}
        onMouseDown={this.onSuggestionClick}
      >
        {inner}
      </div>
    )
  }

  selectEnd() {
    const { textbox } = this
    if (
      textbox &&
      typeof textbox.value === 'string' &&
      textbox.value.length > 0
    ) {
      const vlen = textbox.value.length
      if (vlen > 0) {
        textbox.selectionStart = vlen
        textbox.selectionEnd = vlen
      }
    }
  }

  setTextbox = ref => (this.textbox = ref)

  hasTextarea = () =>
    this.textbox && this.textbox.tagName.toLowerCase() === 'textarea'

  insertText = text => {
    const { textbox, hasTextarea } = this
    if (!hasTextarea) {
      return // somehow we bound the events but it's not mobile textarea
    }
    const { selectionStart: start, selectionEnd: end } = textbox
    this.replaceText({ start, end, text })
  }

  replaceText = ({ start, end, text }) => {
    const { textbox, hasTextarea } = this
    if (!hasTextarea) {
      return // somehow we bound the events but it's not mobile textarea
    }
    const newText =
      textbox.value.substring(0, start) +
      text +
      textbox.value.substring(end, textbox.value.length)
    this.textbox.value = newText
    this.props.onChange({ text: newText })
  }

  composerReset = evt => {
    const { composerId } = evt.detail
    if (composerId === this.props.composerId && this.textbox) {
      const { text = '' } = this.props
      this.textbox.value = text
    }
    window.composerHasText = false
  }

  // insert text at cursor from a another component e.g. emoji
  composerInsert = evt => {
    const { composerId, text } = evt.detail
    if (composerId === this.props.composerId) {
      this.insertText(text)
    }
  }

  // replace text near cursor from a another component e.g. suggestions
  composerReplace = evt => {
    const { composerId } = evt.detail
    if (composerId === this.props.composerId) {
      this.replaceText(evt.detail)
    }
  }

  onFocus = evt => {
    // bubble up
    this.props.onFocus(evt)
  }

  render() {
    const {
      text,
      markdown,
      small = false,
      suggestions,
      disabled,
      placeholder,
      onKeyUp,
      children,
      id,
      isEdit,
      isModalOpen,
      composerId,
      autoFocus,
      rte_controls_visible
    } = this.props

    const { suggestionsHidden } = this.state

    const textareaContainerClasses = CX({
      d: 1,
      maxW100PC: 1,
      flexGrow1: small,
      jcCenter: small,
      py5: small
    })

    const textareaClasses = CX({
      d: 1,
      font: 1,
      wrap: 1,
      resizeNone: 1,
      bgTransparent: 1,
      outlineNone: 1,
      lineHeight125: 1,
      cPrimary: 1,
      w100PC: !small,
      py10: 1,
      px15: 1,
      fs16PX: !small,
      fs14PX: small,
      maxH200PX: small,
      maxH80VH: !small
    })

    return (
      <>
        <div className={textareaContainerClasses}>
          <label
            htmlFor={id}
            className={[_s.visiblyHidden, _s.displayNone].join(' ')}
          >
            {placeholder}
          </label>
          <Responsive max={BREAKPOINT_EXTRA_SMALL}>
            <Textarea
              id={id}
              inputRef={this.setTextbox}
              className={textareaClasses}
              disabled={disabled}
              placeholder={placeholder}
              autoFocus={autoFocus}
              value={text}
              onChange={this.onTextareaChange}
              onKeyDown={this.onKeyDown}
              onKeyUp={onKeyUp}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              onPaste={this.props.onPaste}
              aria-autocomplete="list"
            />
            {(!isModalOpen && !text) && (
              <Icon
                id="pencil"
                className={[
                  _s.cSecondary,
                  _s.posAbs,
                  _s.mt15,
                  _s.mr15,
                  _s.right0,
                  _s.pointerEventsNone
                ].join(' ')}
                size="0.9em"
              />
            )}
          </Responsive>
          <Responsive min={BREAKPOINT_EXTRA_SMALL}>
            <Composer
              inputRef={this.setTextbox}
              disabled={disabled}
              placeholder={placeholder}
              text={text}
              markdown={markdown}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              onKeyUp={onKeyUp}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              onPaste={this.props.onPaste}
              onUpload={this.props.onUpload}
              small={small}
              isEdit={isEdit}
              cursorPosition={this.props.cursorPosition}
              composerId={composerId}
              autoFocus={autoFocus}
              rte_controls_visible={rte_controls_visible}
            />
          </Responsive>
          {children}
        </div>
        {!small && !suggestionsHidden && suggestions.length > 0 && (
          <div className={[_s.d].join(' ')}>
            {suggestions.map(this.renderSuggestion)}
          </div>
        )}
      </>
    )
  }
}

AutosuggestTextbox.propTypes = {
  text: PropTypes.string,
  markdown: PropTypes.string,
  suggestions: PropTypes.array,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  onSuggestionSelected: PropTypes.func.isRequired,
  onSuggestionsClearRequested: PropTypes.func.isRequired,
  onSuggestionsFetchRequested: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyUp: PropTypes.func,
  onKeyDown: PropTypes.func,
  id: PropTypes.string,
  onPaste: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  textarea: PropTypes.bool,
  small: PropTypes.bool,
  isEdit: PropTypes.bool,
  cursorPosition: PropTypes.number,
  composerId: PropTypes.string,
  autoFocus: PropTypes.bool
}

export default AutosuggestTextbox
