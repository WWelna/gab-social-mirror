import React from 'react'
import { connect } from 'react-redux'
import { me } from '../initial_state'
import { shortNumberFormat } from '../utils/numbers'
import ListItem from './list_item'
import Icon from './icon'
import Text from './text'

class ListListItem extends React.PureComponent {
  
  render() {
    const { list } = this.props
    
    if (!list) return null

    const owner = list.get('account')
    let subtitle = `Created by ${owner.get('id') === me ? 'you' : `@${owner.get('username')}`}`
    let visibility = list.get('visibility')
    let subCount = list.get('subscriber_count')
    let memCount = list.get('member_count')
    if (subCount > 0 && visibility === 'public') {
      subtitle += ` · ${shortNumberFormat(list.get('subscriber_count'))} subscriber${subCount === 0 || subCount > 1 ? 's' : ''}`
    }
    if (memCount > 0) {
      subtitle += ` · ${shortNumberFormat(list.get('member_count'))} member${memCount === 0 || memCount > 1 ? 's' : '' }`
    }

    return (
      <ListItem
        to={`/feeds/${list.get('id')}`}
        title={(
          <span>
            <Icon id={visibility === 'private' ? 'lock' : 'globe'} size='12px' className={_s.pr5} />
            <Text size='medium' weight='bold'>{list.get('title')}</Text>
          </span>
        )}
        subtitle={subtitle}
      />
    )
  }

}

const mapStateToProps = (state, { id }) => ({
  list: state.getIn(['lists', 'items', id]),
})

ListListItem.propType = {
  // 
}

export default connect(mapStateToProps)(ListListItem)