import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {
  MODAL_COMPOSE,
  MAX_POST_CHARACTER_COUNT,
  POPOVER_COMPOSE_POST_DESTINATION
} from '../../../constants'
import { openModal } from '../../../actions/modal'
import { openPopover } from '../../../actions/popover'
import Avatar from '../../../components/avatar'
import Button from '../../../components/button'
import Icon from '../../../components/icon'
import Text from '../../../components/text'
import CharacterCounter from '../../../components/character_counter'

class ComposeDestinationHeader extends ImmutablePureComponent {
  handleOnClick = () => this.props.onOpenPopover(this.desinationBtn)
  setDestinationRef = ref => (this.desinationBtn = ref)

  render() {
    const { account, isEdit, isComment, group, groupId, formLocation, text } =
      this.props

    const isIntroduction = formLocation === 'introduction'

    let editText = isEdit ? ' edit ' : ' '
    let groupTitle = !!group ? group.get('title') : ''
    groupTitle =
      groupTitle.length > 32
        ? `${groupTitle.substring(0, 32).trim()}...`
        : groupTitle
    if (!groupTitle && groupId) groupTitle = 'group'

    let title = `Post${editText}to timeline`
    if (!!groupId) {
      if (isComment) {
        title = `Comment${editText}in ${groupTitle}`
      } else {
        title = `Post${editText}to ${groupTitle}`
      }
    } else {
      if (isComment) {
        title = `Post${editText}as comment`
      }
    }

    const charCount =
      typeof text === 'string' && text.length > 0 ? (
        <CharacterCounter max={MAX_POST_CHARACTER_COUNT} text={text} />
      ) : null

    return (
      <div
        className={[
          _s.d,
          _s.flexRow,
          _s.aiCenter,
          _s.bgPrimary,
          _s.w100PC,
          _s.h40PX,
          _s.pr15
        ].join(' ')}
        onDrop={this.props.onDrop}
      >
        <div
          className={[
            _s.d,
            _s.flexRow,
            _s.aiCenter,
            _s.pl15,
            _s.flexGrow1,
            _s.mrAuto,
            _s.h40PX
          ].join(' ')}
        >
          <Avatar account={account} size={28} noHover={true} />
          {!isIntroduction && (
            <div className={[_s.ml15].join(' ')}>
              <Button
                isNarrow
                isOutline
                radiusSmall
                buttonRef={this.setDestinationRef}
                backgroundColor="secondary"
                color="primary"
                onClick={isComment || isEdit ? undefined : this.handleOnClick}
                className={[_s.border1PX, _s.borderColorPrimary].join(' ')}
              >
                <Text color="inherit" size="small" className={_s.jcCenter}>
                  {title}
                  {!isComment && !isEdit && (
                    <Icon id="caret-down" size="8px" className={_s.ml5} />
                  )}
                </Text>
              </Button>
            </div>
          )}
        </div>
        {charCount}
      </div>
    )
  }
}

const mapStateToProps = (state, { groupId }) => ({
  group: state.getIn(['groups', groupId]),
  width: state.getIn(['settings', 'window_dimensions', 'width'])
})

const mapDispatchToProps = (dispatch, { onDestination, groupId }) => ({
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
  }
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
  groupId: PropTypes.string
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ComposeDestinationHeader)
