import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import slugify from '../utils/slugify'
import unslugify from '../utils/unslugify'
import { fetchGroupsByCategory } from '../actions/groups'
import Block from '../components/block'
import ColumnIndicator from '../components/column_indicator'
import Heading from '../components/heading'
import GroupListItem from '../components/group_list_item'
import ScrollableList from "../components/scrollable_list";

class GroupCategory extends ImmutablePureComponent {
  componentDidMount() {
    const { sluggedCategory } = this.props.params
    this.props.onFetchGroupsByCategory(sluggedCategory)
  }

  render() {
    const {
      isFetched = false,
      isLoading = true,
      hasMore = true,
      groupIds = [],
    } = this.props
    const { sluggedCategory } = this.props.params
    const title = unslugify(sluggedCategory)

    let emptyMessage

    if (isFetched && groupIds.size === 0) {
			emptyMessage = 'There are no groups to display'
		}

    const groups = groupIds.map((groupId, i) => (
      <GroupListItem
        isAddable
        key={`group-collection-item-${groupId}`}
        id={groupId}
      />
    ))
  
		return (
			<Block>
				<div className={[_s.d, _s.flexRow, _s.px15, _s.pt10].join(' ')}>
					<div className={[_s.d, _s.aiStart, _s.overflowHidden].join(' ')}>
						<Heading size='h2'>
							Groups by category: {title}
						</Heading>
					</div>
				</div>
				<div className={[_s.d, _s.py10, _s.w100PC].join(' ')}>
          <ScrollableList
            scrollKey={`group-category-${sluggedCategory}`}
            onLoadMore={() => this.props.onFetchGroupsByCategory(sluggedCategory)}
            disableInfiniteScroll={false}
            isLoading={isLoading}
            showLoading={isLoading && groups.size === 0}
            hasMore={hasMore}
            emptyMessage={emptyMessage}
          >
            {groups}
          </ScrollableList>
				</div>
			</Block>
		)
  }
}

const mapStateToProps = (state, { params: { sluggedCategory } }) => {
  const path = ['group_lists', 'by_category', sluggedCategory]
  return {
    groupIds: state.getIn([...path, 'groupIds']),
    isFetched: state.getIn([...path, 'isFetched']),
    isLoading: state.getIn([...path, 'isLoading']),
    hasMore: state.getIn([...path, 'hasMore']),
  }
}

const mapDispatchToProps = (dispatch) => ({
  onFetchGroupsByCategory: (sluggedCategory) => dispatch(fetchGroupsByCategory(sluggedCategory)),
})

GroupCategory.propTypes = {
  groupIds: ImmutablePropTypes.list,
	isFetched: PropTypes.bool,
  isLoading: PropTypes.bool,
  hasMore: PropTypes.bool,
  onFetchGroupsByCategory: PropTypes.func.isRequired,
  params: PropTypes.object,
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupCategory)
