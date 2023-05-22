import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import GroupCollectionItem from '../group_collection_item'
import TimelineInjectionLayout from './timeline_injection_layout'

class FeaturedGroupsInjection extends ImmutablePureComponent {
  render() {
    const { groupIds, isFetched, isXS, injectionId } = this.props

    if (isFetched && groupIds.size === 0) {
      return <div />
    }

    return (
      <TimelineInjectionLayout
        id={injectionId}
        title="Featured groups"
        buttonLink="/groups/browse/featured"
        buttonTitle="See more featured groups"
        isXS={isXS}
      >
        {groupIds.map((groupId, i) => (
          <GroupCollectionItem
            isAddable
            id={groupId}
            key={`featured-group-${i}-${groupId}`}
          />
        ))}
      </TimelineInjectionLayout>
    )
  }
}

const mapStateToProps = state => ({
  groupIds: state.getIn(['group_lists', 'featured', 'items']),
  isFetched: state.getIn(['group_lists', 'featured', 'isFetched']),
  isLoading: state.getIn(['group_lists', 'featured', 'isLoading'])
})

FeaturedGroupsInjection.propTypes = {
  groupIds: ImmutablePropTypes.list,
  isFetched: PropTypes.bool,
  isLoading: PropTypes.bool,
  injectionId: PropTypes.string
}

export default connect(mapStateToProps)(FeaturedGroupsInjection)
