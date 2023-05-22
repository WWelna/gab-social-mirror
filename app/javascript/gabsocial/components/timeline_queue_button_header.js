import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { CX, TIMELINES_MAX_QUEUE_ITEMS } from '../constants'
import Button from './button'
import Text from './text'
import { timelineDequeue } from '../store/timelines'
import reduxStore from '../store'

class TimelineQueueButtonHeader extends React.PureComponent {

  handleOnClick = () => {
    if (this.props.timelineId) {
      reduxStore.dispatch(timelineDequeue(this.props.timelineId))
    } else {
      window.location.reload();
    }
  }

  render() {
    const { count, itemType, top } = this.props
    const hasItems = count > 0

    const displayCount = count >= TIMELINES_MAX_QUEUE_ITEMS ?
      `${TIMELINES_MAX_QUEUE_ITEMS}+` :
      count

    const containerClasses = CX({ d: 1, aiCenter: 1, zi300: 1 })
    const innerContainerClasses = CX({ d: 1 })
    const visible = hasItems

    return (
      <div
        ref={this.setRef}
        className={containerClasses}
        style={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'all 200ms',
          position: 'absolute',
          top: top,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div className={innerContainerClasses}>
          <Button
            isNarrow
            color='white'
            backgroundColor='brand'
            onClick={this.handleOnClick}
            className={_s.boxShadowBlock}
          >
            <Text color='inherit' size='small'>
              <FormattedMessage
                id='timeline_queue.label'
                defaultMessage='{count} new {type}'
                values={{
                  count: displayCount,
                  type: count === 1 ? itemType : `${itemType}s`,
                }}
              />
            </Text>
          </Button>
        </div>
      </div>
    )
  }

}

TimelineQueueButtonHeader.propTypes = {
  onClick: PropTypes.func,
  count: PropTypes.number,
  itemType: PropTypes.string,
  top: PropTypes.string,
  timelineId: PropTypes.string,
}

TimelineQueueButtonHeader.defaultProps = {
  count: 0,
  itemType: 'item',
  top: '0',
}

export default TimelineQueueButtonHeader
