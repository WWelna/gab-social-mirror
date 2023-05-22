import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {
  CX,
  BREAKPOINT_EXTRA_SMALL,
  MODAL_COMPOSE,
  MAX_POST_CHARACTER_COUNT,
  POPOVER_COMPOSE_POST_CONTEXT,
  POPOVER_COMPOSE_POST_DESTINATION,
} from '../../../constants'
import { openModal } from '../../../actions/modal'
import { openPopover } from '../../../actions/popover'
import Avatar from '../../../components/avatar'
import Icon from '../../../components/icon'
import Text from '../../../components/text'
import CharacterCounter from '../../../components/character_counter'

class ComposeDestinationHeader extends ImmutablePureComponent {
  handleOnClick = () => {
    this.props.onOpenPopover(this.desinationBtn)
  }

  setContextRef = (ref) => {
    this.contextBtn = ref
  }

  handleOnClickContext = () => {
    this.props.onOpenContextPopover(this.contextBtn)
  }

  setDestinationRef = (ref) => {
    this.desinationBtn = ref
  }

  render() {
    const {
      account,
      isEdit,
      isComment,
      group,
      groupId,
      formLocation,
      text,
      width,
      selectedStatusContext,
    } = this.props

    const isXS = width <= BREAKPOINT_EXTRA_SMALL
    const isIntroduction = formLocation === 'introduction'

    let editText = isEdit ? ' edit ' : ' '
    let groupTitle = !!group ? group.get('title') : ''
    if (!groupTitle && groupId) groupTitle = 'group'

    let title = `Post${editText}to timeline`
    if (!!groupId) {
      if (isComment) title = `Comment${editText}in ${groupTitle}`
      else title = `Post${editText}to ${groupTitle}`
    } else {
      if (isComment) title = `Post${editText}as comment`
    }

    const charCount = typeof text === 'string' && text.length > 0 ? (
      <div className={[_s.d].join(' ')}>
        <CharacterCounter max={MAX_POST_CHARACTER_COUNT} text={text} />
      </div>
    ) : null

    let contextTitle = isXS ? 'Context' : 'Add context'
    if (!!selectedStatusContext) contextTitle = selectedStatusContext.get('name')
    
    const containerClasses = CX({
      d: 1,
      flexRow: 1,
      aiCenter: 1,
      bgPrimary: 1,
      w100PC: 1,
      h40PX: 1,
      px15: !isXS,
      px10: isXS,
    })

    const innerContainerClasses = CX({
      d: 1,
      flexRow: 1,
      aiCenter: 1,
      maxW100PC: isXS,
      maxW100PC30PX: !isXS,
      flexGrow1: 1,
      mrAuto: 1,
      h40PX: 1,
    })

    const actionContainerClasses = CX({
      d: 1,
      maxW100PC30PX: 1,
      flexRow: 1,
      flexGrow1: 1,
      ml15: !isXS,
      ml10: isXS,
    })

    const btnClasses = CX({
      d: 1,
      cursorPointer: 1,
      radiusSmall: 1,
      bgSubtle: 1,
      outlineNone: 1,
      flexRow: 1,
      aiCenter: 1,
      maxW48PC: 1,
      overflowHidden: 1,
      textOverflowEllipsis2: 1,
      whiteSpaceNoWrap: 1,
      mr10: 1,
      px10: 1,
      py7: !isXS,
      h30PX: !isXS,
      py5: isXS,
      h24PX: isXS,
    })

    const textClasses = (isComment) => CX({
      maxW100PC15PX: !isComment,
      overflowHidden: 1,
      textOverflowEllipsis2: 1,
      whiteSpaceNoWrap: 1,
    })

    return (
      <div className={containerClasses} onDrop={this.props.onDrop}>
        <div className={innerContainerClasses}>
          <Avatar account={account} size={isXS ? 20 : 28} noHover={true} />
          {!isIntroduction && (
            <div className={actionContainerClasses}>
              <button
                ref={this.setDestinationRef}
                onClick={isComment || isEdit ? undefined : this.handleOnClick}
                className={btnClasses}
              >
                <Text color="primary" size='small' className={textClasses(isComment)}>
                  {title}
                </Text>
                {!isComment && !isEdit && (
                  <Icon id="caret-down" size="8px" className={[_s.cPrimary, _s.ml7].join(' ')} />
                )}
              </button>
              <button
                ref={this.setContextRef}
                onClick={this.handleOnClickContext}
                className={btnClasses}
              >
                <Text color='primary' size='small' className={textClasses()}>
                  {contextTitle}
                </Text>
                <Icon id="caret-down" size="8px" className={[_s.cPrimary, _s.ml7].join(' ')} />
              </button>
            </div>
          )}
        </div>
        {!isXS && charCount}
      </div>
    )
  }
}

const mapStateToProps = (state, { groupId, selectedStatusContextId }) => ({
  group: state.getIn(['groups', groupId]),
  selectedStatusContext: !!selectedStatusContextId ? state.getIn(['status_contexts', 'objects', selectedStatusContextId]) : null,
  width: state.getIn(['settings', 'window_dimensions', 'width'])
})

const mapDispatchToProps = (dispatch, { onDestination, groupId, onStatusContextChange, selectedStatusContextId }) => ({
  onOpenModal() {
    dispatch(openModal(MODAL_COMPOSE))
  },
  onOpenPopover(targetRef) {
    dispatch(
      openPopover(POPOVER_COMPOSE_POST_DESTINATION, {
        targetRef,
        position: 'bottom',
        onDestination,
        groupId
      })
    )
  },
  onOpenContextPopover(targetRef) {
    dispatch(openPopover(POPOVER_COMPOSE_POST_CONTEXT, {
      targetRef,
      position: 'bottom',
      onStatusContextChange,
      selectedStatusContextId,
    }))
  },
})

ComposeDestinationHeader.propTypes = {
  account: ImmutablePropTypes.map,
  isModal: PropTypes.bool,
  onOpenModal: PropTypes.func.isRequired,
  onOpenPopover: PropTypes.func.isRequired,
  formLocation: PropTypes.string,
  isComment: PropTypes.bool.isRequired,
  isEdit: PropTypes.bool.isRequired,
  feature: PropTypes.string,
  groupId: PropTypes.string,
  selectedStatusContextId: PropTypes.string,
  onStatusContextChange: PropTypes.func,
}

export default connect( mapStateToProps, mapDispatchToProps)(ComposeDestinationHeader)
