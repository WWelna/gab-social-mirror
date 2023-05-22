import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { NavLink } from 'react-router-dom'
import { defineMessages, injectIntl } from 'react-intl'
import { CX } from '../constants'
import { PLACEHOLDER_MISSING_HEADER_SRC } from '../constants'
import { shortNumberFormat } from '../utils/numbers'
import Icon from './icon'
import Image from './image'
import Text from './text'
import Dummy from './dummy'
import GroupActionButton from './group_action_button'

class GroupListItem extends ImmutablePureComponent {

  render() {
    const {
      group,
      intl,
      isAddable,
      isLast,
      isHidden,
      isStatic,
      size,
      relationships,
      withDescription,
      withVisibility,
    } = this.props

    if (!group) return null

    if (isHidden) {
      return (
        <React.Fragment>
          {group.get('title')}
        </React.Fragment>
      )
    }

    const isLarge = size === 'large'

    const containerClasses = CX({
      d: 1,
      overflowHidden: 1,
      bgSubtle_onHover: 1,
      borderColorSecondary: 1,
      borderBottom1PX: !isLast,
      flexRow: 1,
      py5: !isLarge,
      py10: isLarge,
      pr5: isAddable,
      w100PC: 1,
    })

    const containerLinkClasses = CX({
      d: 1,
      flexRow: 1,
      noUnderline: 1,
      w100PC: 1,
      flexGrow1: isAddable,
      flexShrink1: isAddable,
    })

    const coverImageClasses = CX({
      radiusSmall: 1,
      ml15: 1,
      h53PX: !isLarge,
      w84PX: !isLarge,
      h84PX: isLarge,
      w158PX: isLarge,
    })
    
    const isVisible = group.get('is_visible')
    const coverSrc = group.get('cover_image_thumbnail_url') || group.get('cover_image_url') || ''
    const coverMissing = coverSrc.indexOf(PLACEHOLDER_MISSING_HEADER_SRC) > -1 || !coverSrc
    const memCount = group.get('member_count')
    const memCountFormatted = shortNumberFormat(memCount)
    const memberTitle = ` member${memCount === 0 || memCount > 1 ? 's' : '' }`

    let correctedDescription = group.get('description_html')
    const maxDescription = 160
    correctedDescription = correctedDescription.length >= maxDescription ? `${correctedDescription.substring(0, maxDescription).trim()}...` : correctedDescription


    const Wrapper = !isStatic ? NavLink : Dummy

    return (
      <div className={containerClasses}>
        <Wrapper
          to={`/groups/${group.get('id')}`}
          className={containerLinkClasses}
        >

          {
            !coverMissing &&
            <Image
              isLazy
              src={coverSrc}
              alt={group.get('title')}
              className={coverImageClasses}
            />
          }

          <div className={[_s.d, _s.px10, _s.flexShrink1].join(' ')}>
            <div className={[_s.d, _s.flexRow, _s.mt2, _s.aiCenter].join(' ')}>
              <Text weight='bold' size={isLarge ? 'medium' : 'normal'}>
                {group.get('title')}
              </Text>
              {
                group.get('is_verified') &&
                <Icon id='verified-group' size='14px' className={_s.ml5} />
              }
            </div>
            
            <div className={[_s.d, _s.flexRow, _s.mt5].join(' ')}>
              {
                withVisibility &&
                <Text color='secondary' size='small' className={_s.mr5}>
                  {isVisible ? 'Visible group' : 'Invisible group'}
                  &nbsp;·
                </Text>
              }
              <Text color='secondary' size='small'>
                {memCountFormatted}
                {memberTitle}
              </Text>
            </div>
            
            {
              withDescription &&
              <div className={[_s.d, _s.pt5].join(' ')}>
                <Text color='secondary'>
                  <div
                    className={_s.dangerousContent}
                    dangerouslySetInnerHTML={{ __html: correctedDescription }}
                  />
                </Text>
              </div>
            }

          </div>
        </Wrapper>
        {
          isAddable &&
          <div className={[_s.d, _s.jcCenter, _s.flexGrow1].join(' ')}>
            <GroupActionButton
              group={group}
              relationships={relationships}
              size='small'
            />
          </div>
        }
      </div>
    )
  }

}

const messages = defineMessages({
  members: { id: 'groups.card.members', defaultMessage: 'Members' },
})

const mapStateToProps = (state, { id }) => ({
  group: state.getIn(['groups', id]),
  relationships: state.getIn(['group_relationships', id]),
})

GroupListItem.propTypes = {
  group: ImmutablePropTypes.map,
  isAddable: PropTypes.bool,
  isHidden: PropTypes.bool,
  isLast: PropTypes.bool,
  isStatic: PropTypes.bool,
  size: PropTypes.oneOf([
    'normal',
    'large',
  ]),
  withDescription: PropTypes.bool,
  withVisibility: PropTypes.bool,
  relationships: ImmutablePropTypes.map,
}

GroupListItem.defaultProps = {
  isLast: false,
  size: 'normal',
}

export default injectIntl(connect(mapStateToProps)(GroupListItem))
