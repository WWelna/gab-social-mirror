import React from 'react'
import PropTypes from 'prop-types'
import {
  getDefaultKeyBinding,
  Editor,
  EditorState,
  CompositeDecorator,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  ContentState,
  Modifier
} from 'draft-js'
import draftToMarkdown from '../features/ui/util/draft_to_markdown'
import markdownToDraft from '../features/ui/util/markdown_to_draft'
import { urlRegex } from '../features/ui/util/url_regex'
import { CX } from '../constants'
import RichTextEditorBar from './rich_text_editor_bar'

import '!style-loader!css-loader!draft-js/dist/Draft.css'

const markdownOptions = {
  escapeMarkdownCharacters: false,
  preserveNewlines: true,
  remarkablePreset: 'commonmark',
  remarkableOptions: {
    disable: {
      inline: ['links'],
      block: ['table', 'heading']
    },
    enable: {
      inline: ['del', 'ins']
    }
  }
}

const getBlockStyle = block => {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote'
    default:
      return null
  }
}

function groupHandleStrategy(contentBlock, callback) {
  findWithRegex(GROUP_HANDLE_REGEX, contentBlock, callback)
}

function handleStrategy(contentBlock, callback) {
  findWithRegex(HANDLE_REGEX, contentBlock, callback)
}

function hashtagStrategy(contentBlock, callback) {
  findWithRegex(HASHTAG_REGEX, contentBlock, callback)
}

function cashtagStrategy(contentBlock, callback) {
  findWithRegex(CASHTAG_REGEX, contentBlock, callback)
}

function urlStrategy(contentBlock, callback) {
  findWithRegex(urlRegex, contentBlock, callback)
}

const findWithRegex = (regex, contentBlock, callback) => {
  const text = contentBlock.getText()
  let matchArr, start
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index
    callback(start, start + matchArr[0].length)
  }
}

const HighlightedSpan = props => {
  return (
    <span className={_s.cBrand} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  )
}

const compositeDecorator = new CompositeDecorator([
  {
    strategy: handleStrategy,
    component: HighlightedSpan
  },
  {
    strategy: hashtagStrategy,
    component: HighlightedSpan
  },
  {
    strategy: cashtagStrategy,
    component: HighlightedSpan
  },
  {
    strategy: urlStrategy,
    component: HighlightedSpan
  },
  {
    strategy: groupHandleStrategy,
    component: HighlightedSpan
  }
])

const styleMap = {
  CODE: {
    padding: '0.25em 0.5em',
    backgroundColor: 'var(--border_color_secondary)',
    color: 'var(--text_color_secondary)',
    fontSize: 'var(--fs_n)'
  }
}

const GROUP_HANDLE_REGEX = /(?:^|[^\/\)\w])g\/([a-zA-Z]{1,})/g
const HANDLE_REGEX = /\@[\w]+/g
const HASHTAG_REGEX = /\#[\w\u0590-\u05ff]+/g
const CASHTAG_REGEX = /\$[\w\u0590-\u05ff]+/g

class Composer extends React.PureComponent {
  state = {
    editorState: EditorState.createEmpty(compositeDecorator),
    text: this.props.text,
    markdown: this.props.markdown
  }

  componentDidMount() {
    this.replaceEditorText({ focus: this.props.autoFocus })
    window.addEventListener('composer-insert', this.composerInsert)
    window.addEventListener('composer-replace', this.composerReplace)
    window.addEventListener('composer-reset', this.composerReset)
  }

  componentWillUnmount() {
    window.removeEventListener('composer-insert', this.composerInsert)
    window.removeEventListener('composer-replace', this.composerReplace)
    window.removeEventListener('composer-reset', this.composerReset)
  }

  /**
   * Replace the editor contents with whatever is from the parent and push the
   * selection to the end.
   * @method replaceEditorText
   * @param {boolean} options.focusable
   */
  replaceEditorText({ focus }) {
    let { editorState } = this.state
    const { text, markdown, isEdit, cursorPosition } = this.props
    if (markdown && isEdit) {
      const rawData = markdownToDraft(markdown, markdownOptions)
      const contentState = convertFromRaw(rawData)
      editorState = EditorState.push(editorState, contentState)
    } else if (typeof text === 'string') {
      editorState = EditorState.push(
        editorState,
        ContentState.createFromText(text)
      )
    }
    if (focus) {
      const currentSelection = editorState.getSelection()
      if (
        typeof cursorPosition === 'number' &&
        cursorPosition !== currentSelection.get('anchorOffset') &&
        cursorPosition !== currentSelection.get('focusOffset')
      ) {
        const nextSelection = currentSelection
          .set('anchorOffset', cursorPosition)
          .set('focusOffset', cursorPosition)
          .set('hasFocus', true)
        editorState = EditorState.forceSelection(editorState, nextSelection)
      } else {
        editorState = EditorState.moveFocusToEnd(editorState)
      }
    }
    this.setState({ editorState })
  }

  composerReset = evt => {
    const { composerId } = evt.detail
    if (composerId === this.props.composerId) {
      this.replaceEditorText({ focus: false })
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

  // complicated looking way to insert text
  insertText = text => {
    let { editorState } = this.state
    const currentContent = editorState.getCurrentContent()
    const currentSelection = editorState.getSelection()
    const newContent = Modifier.replaceText(
      currentContent,
      currentSelection,
      text
    )
    const newEditorState = EditorState.push(
      editorState,
      newContent,
      'insert-text'
    )
    editorState = EditorState.forceSelection(
      newEditorState,
      newContent.getSelectionAfter()
    )
    this.onChange(editorState)
  }

  // complicated looking way to replace text
  replaceText = ({ start, end, text }) => {
    let { editorState } = this.state
    const currentContent = editorState.getCurrentContent()
    const replaceSelection = editorState.getSelection().merge({
      anchorOffset: start,
      focusOffset: end
    })

    const newContent = Modifier.replaceText(
      currentContent,
      replaceSelection,
      text
    )

    const newEditorState = EditorState.push(
      editorState,
      newContent,
      'replace-text'
    )
    editorState = EditorState.forceSelection(
      newEditorState,
      newContent.getSelectionAfter()
    )
    this.onChange(editorState)
  }

  // extract text and markdown and bubble up
  onChange = editorState => {
    const content = editorState.getCurrentContent()
    // const text = content.gettext('\u0001')

    const blocks = convertToRaw(editorState.getCurrentContent()).blocks
    const text = blocks
      .map(block => (!block.text.trim() && '') || block.text)
      .join('\n')

    const selectionState = editorState.getSelection()
    const currentBlockKey = selectionState.getStartKey()
    const currentBlockIndex = blocks.findIndex(k => k.key === currentBlockKey)
    const priorBlockTextLength = blocks
      .splice(0, currentBlockIndex)
      .map(block => (!block.text.trim() && '') || block.text)
      .join('\n').length
    const selectionStart = selectionState.getStartOffset()
    const toAdd = currentBlockIndex === 0 ? 0 : 1
    const cursorPosition = priorBlockTextLength + selectionStart + toAdd

    const rawObject = convertToRaw(content)
    const markdown = draftToMarkdown(rawObject, markdownOptions)

    this.setState({ editorState, text, markdown })
    this.props.onChange({ text, markdown, cursorPosition })
    if (text) {
      window.composerHasText = true
    } else {
      window.composerHasText = false
    }
  }

  keyBindingFn = e => {
    if (e.type === 'keydown') {
      this.props.onKeyDown(e)
    }
    return getDefaultKeyBinding(e)
  }

  handleKeyCommand = command => {
    const { editorState } = this.state
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      this.onChange(newState)
      return true
    }
    return false
  }

  setRef = n => {
    try {
      this.textbox = n
      this.props.inputRef(n)
    } catch (error) {
      //
    }
  }

  onFocus = evt => {
    // bubble up
    this.props.onFocus(evt)
  }

  render() {
    const { disabled, placeholder, small, rte_controls_visible } = this.props
    const { editorState } = this.state

    const editorContainerClasses = CX({
      d: 1,
      cursorText: 1,
      text: 1,
      cPrimary: 1,
      fs16PX: !small,
      fs14PX: small,
      pt15: !small,
      px15: !small,
      px10: small,
      pb10: !small,
      h100PC: !small
    })

    return (
      <div className={[_s.d, _s.flex1].join(' ')}>
        <RichTextEditorBar
          editorState={editorState}
          onChange={this.onChange}
          rte_controls_visible={rte_controls_visible}
        />
        <div className={editorContainerClasses}>
          <Editor
            blockStyleFn={getBlockStyle}
            editorState={editorState}
            customStyleMap={styleMap}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            placeholder={placeholder}
            ref={this.setRef}
            readOnly={disabled}
            keyBindingFn={this.keyBindingFn}
            onFocus={this.onFocus}
            onBlur={this.props.onBlur}
            handlePastedFiles={this.props.onPaste}
            stripPastedStyles
            spellCheck
          />
        </div>
      </div>
    )
  }
}

Composer.propTypes = {
  inputRef: PropTypes.func,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  text: PropTypes.string,
  markdown: PropTypes.string,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  onPaste: PropTypes.func,
  small: PropTypes.bool,
  isEdit: PropTypes.bool,
  cursorPosition: PropTypes.number
}

export default Composer
