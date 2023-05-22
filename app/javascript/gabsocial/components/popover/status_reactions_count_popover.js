import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { shortNumberFormat } from '../../utils/numbers'
import PopoverLayout from './popover_layout'
import ReactionTypeImage from '../reaction_type_image'
import Text from '../text'

class StatusReactionsCountPopover extends ImmutablePureComponent {

  render() {
    const { status, statusId, isXS } = this.props
    
    const reactionsMap = status.get('reactions_counts')
    const selectedReactionTypeId = status.get('reaction')
    const totalCount = status.get('favourites_count')
    const titleReaction = `reaction${totalCount === 1 ? '' : 's'}`
    
    return (
      <PopoverLayout
        isXS={isXS}
        width={128}
      >
        <Text weight={isXS ? 'medium' : undefined} className={[_s.d, _s.px10, _s.py10, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
          {shortNumberFormat(totalCount)} {titleReaction}
        </Text>
        <div className={[_s.d, _s.px10, _s.py10, _s.w100PC].join(' ')}>
          {
            reactionsMap.map((block) => (
              <div
                key={`status-${statusId}-reaction-count-${block.get('reactionId')}`} 
                className={[_s.d, _s.flexRow, _s.aiCenter, _s.w100PC, _s.pt2, _s.pb5].join(' ')}
              >
                <ReactionTypeImage reactionTypeId={block.get('reactionId')} size='16px' />
                <Text size='small' className={_s.ml7}>
                  {shortNumberFormat(block.get('count'))}
                </Text>
                {
                  (!!selectedReactionTypeId && `${selectedReactionTypeId}` === `${block.get('reactionId')}`) &&
                  <div className={[_s.posAbs, _s.right0, _s.pt2, _s.z4].join(' ')}>
                    <span className={[_s.cBrand, _s.circle, _s.py2, _s.px2, _s.minW14PX, _s.displayBlock].join(' ')} style={{fontSize: '18px'}}>
                      •
                    </span>
                  </div>
                }
              </div>
            ))
          }
          
        </div>
      </PopoverLayout>
    )
  }

}

const mapStateToProps = (state, { statusId }) => ({
  status: state.getIn(['statuses', statusId]),
})

StatusReactionsCountPopover.propTypes = {
  status: ImmutablePropTypes.map.isRequired,
  statusId: PropTypes.string.isRequired,
  isXS: PropTypes.bool,
}

export default connect(mapStateToProps)(StatusReactionsCountPopover)