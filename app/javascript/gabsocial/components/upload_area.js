import React from 'react'
import PropTypes from 'prop-types'
import { defineMessages, injectIntl } from 'react-intl'
import spring from 'react-motion/lib/spring'
import Motion from '../features/ui/util/reduced_motion'
import Text from './text'
import { loggedIn } from '../initial_state'
import { CX } from '../constants'

const messages = defineMessages({
  title: { id: 'upload_area.title', defaultMessage: 'Drag & drop to upload' }
})

const containsOrSame = (parent, check) =>
  parent.contains(check) || parent.isSameNode(check)

const createInitialState = () => ({ dragging: false, dragingOver: false })

class UploadArea extends React.PureComponent {
  state = createInitialState()

  /*keydown = e => {
    if (!this.state.dragging) return
    if (e.keyCode === 27) {
      e.preventDefault()
      e.stopPropagation()
      this.handleDragEnd()
    }
  }*/

  componentDidMount() {
    if (loggedIn) {
      // document.addEventListener('keyup', this.keydown) <-- does nothing
      document.addEventListener('dragenter', this.handleDragEnter, false)
      document.addEventListener('dragover', this.handleDragOver, false)
      document.addEventListener('drop', this.handleDrop, false)
      document.addEventListener('dragleave', this.handleDragLeave, false)
      document.addEventListener('dragend', this.handleDragEnd, false)
    }
  }

  componentWillUnmount() {
    if (loggedIn) {
      // document.removeEventListener('keyup', this.keydown)
      document.removeEventListener('dragenter', this.handleDragEnter)
      document.removeEventListener('dragover', this.handleDragOver)
      document.removeEventListener('drop', this.handleDrop)
      document.removeEventListener('dragleave', this.handleDragLeave)
      document.removeEventListener('dragend', this.handleDragEnd)
    }
  }

  dragTargets = []
  timer = null

  thenIdle = () => {
    if (typeof this.timer === 'number') {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => this.setState(createInitialState()), 2000)
  }

  handleDragEnter = e => {
    const { target, dataTransfer } = e

    if (this.dragTargets.indexOf(target) === -1) {
      this.dragTargets.push(target)
    }

    const { isModal, isModalOpen, outerRef } = this.props
    // confusing: if the modal is open only effect the modal
    const dragging = (isModal && isModalOpen) || (!isModal && !isModalOpen)
    const draggingOver = outerRef && target && outerRef.contains(target)
    if (
      dragging !== this.state.dragging ||
      draggingOver !== this.state.draggingOver
    ) {
      this.setState({ dragging, draggingOver })
    }

    e.preventDefault()
  }

  handleDragOver = e => {
    const { dataTransfer } = e
    if (this.dataTransferIsText(dataTransfer)) return false
    e.preventDefault()
    e.stopPropagation()
    try {
      dataTransfer.dropEffect = 'copy'
    } catch (err) {
      //
    }
    this.thenIdle()
    return false
  }

  handleDrop = e => {
    const { target, dataTransfer } = e
    if (this.dataTransferIsText(dataTransfer)) return
    e.preventDefault()
    this.setState({ dragging: false })
    this.dragTargets = []
    if (
      dataTransfer &&
      dataTransfer.files.length >= 1 &&
      this.contained(target)
    ) {
      this.props.onUpload(dataTransfer.files)
    }
  }

  // heavy-handed checking if element is a child of one of these
  // search containsElement for another complicated example
  contained = element => {
    const { outerRef } = this.props
    const { wrapperRef, bgRef, dropAreaRef } = this
    return (
      containsOrSame(outerRef, element) ||
      containsOrSame(wrapperRef, element) ||
      containsOrSame(bgRef, element) ||
      containsOrSame(dropAreaRef, element)
    )
  }

  handleDragLeave = e => {
    e.preventDefault()
    e.stopPropagation()
    // confusing: elements dragged over are not in the composer?
    this.dragTargets = this.dragTargets.filter(el => el !== this.contained(el))
    if (this.dragTargets.length > 0) return
    this.setState({ dragging: false })
  }

  handleDragEnd = () => this.setState(createInitialState())

  dataTransferIsText = dataTransfer => {
    return (
      dataTransfer &&
      Array.from(dataTransfer.types).includes('text/plain') &&
      dataTransfer.items.length === 1
    )
  }

  setWrapperRef = ref => (this.wrapperRef = ref)
  setBgRef = ref => (this.bgRef = ref)
  setDropAreaRef = ref => (this.dropAreaRef = ref)

  render() {
    const { intl } = this.props
    const { dragging, draggingOver } = this.state

    const wrapper = CX({
      d: true,
      aiCenter: true,
      jcCenter: true,
      bgPrimaryOpaque: true,
      w100PC: true,
      h100PC: true,
      posAbs: true,
      top0: true,
      rightAuto: true,
      bottomAuto: true,
      left0: true,
      px15: dragging,
      py15: dragging
    })

    return (
      <Motion
        defaultStyle={{
          backgroundOpacity: 0,
          backgroundScale: 0.95
        }}
        style={{
          backgroundOpacity: spring(dragging ? 1 : 0, {
            stiffness: 150,
            damping: 15
          }),
          backgroundScale: spring(dragging ? 1 : 0.9, {
            stiffness: 200,
            damping: 3
          })
        }}
      >
        {({ backgroundOpacity, backgroundScale }) => (
          <div
            className={wrapper}
            style={{
              visibility: dragging ? 'visible' : 'hidden',
              opacity: backgroundOpacity
            }}
            ref={this.setWrapperRef}
          >
            <div
              className={[
                _s.d,
                _s.posAbs,
                _s.bgPrimary,
                _s.h100PC,
                _s.w100PC,
                _s.radiusSmall
              ].join(' ')}
              style={{
                transform: `scale(${backgroundScale})`
              }}
              ref={this.setBgRef}
            />
            <div
              className={CX({
                d: true,
                h100PC: true,
                w100PC: true,
                border2PX: true,
                borderColorSecondary: !draggingOver,
                borderColorBrand: draggingOver,
                borderDashed: true,
                radiusSmall: true,
                aiCenter: true,
                jcCenter: true
              })}
              style={{ transition: 'border-color 80ms' }}
              ref={this.setDropAreaRef}
            >
              <Text size="medium" color="secondary">
                {intl.formatMessage(messages.title)}
              </Text>
            </div>
          </div>
        )}
      </Motion>
    )
  }
}

UploadArea.propTypes = {
  intl: PropTypes.object.isRequired,
  onUpload: PropTypes.func,
  // outerRef: PropTypes.node, <--or something?
  isModal: PropTypes.bool,
  isModalOpen: PropTypes.bool
}

export default injectIntl(UploadArea)
