import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { GabAdComment } from '../features/ui/util/async_components'
import Comment from './comment'
import ScrollableList from './scrollable_list'
import WrappedBundle from '../features/ui/util/wrapped_bundle'

class CommentList extends ImmutablePureComponent {
  render() {
    const {
      descendants,
      loadedDirectDescendantsCount,
      onViewComments,
      ancestorAccountId,
      totalDirectDescendants,
      ancestorStatusId,
      highlightStatusId,
      isLoading
    } = this.props

    const size = loadedDirectDescendantsCount
    const max = totalDirectDescendants//Math.min(isLimited ? 2 : upperLimit, size)
    const scrollableContent = []
    let topLevelCommentCount = 0

    // pageKey and adIndex help prevent randomizing ad display on a page
    const pageKey = ancestorStatusId || window.location.href
    let adIndex = 0

    if (!!descendants && descendants.count() > 0) {
      for (let i = 0; i < descendants.count(); i++) {
        const descendant = descendants.get(i)
        const statusId = descendant.get('statusId')
        const isTopLevelComment = descendant.get('indent') === 0
        if (isTopLevelComment) topLevelCommentCount++

         // gab ad comment injections
        if (
          isTopLevelComment && // only top level
          (topLevelCommentCount === 3 || // always 3rd slot |OR|
          topLevelCommentCount % 9 === 0) && // then every 9
          i !== 0 // dont put an ad in top slot
        ) {
          adIndex += 1
          scrollableContent.push(
            <WrappedBundle
              component={GabAdComment}
              componentParams={{ pageKey, position: adIndex }}
              key={`gab-ad-comment-injection-${i}`}
            />
          )
        }

        if (!!statusId) {
          scrollableContent.push(
            <Comment
              key={`comment-${statusId}-${i}`}
              id={statusId}
              ancestorAccountId={ancestorAccountId}
              indent={descendant.get('indent')}
              isHighlighted={descendant.get('isHighlighted')}
              contextType='comments'
            />
          )
        }
      }
    }

    return (
      <ScrollableList
        scrollKey='comments'
        hasMore={size < max}
        onLoadMore={onViewComments}
        disableInfiniteScrollUntilClicked={!!highlightStatusId}
        isLoading={isLoading}
      >
        {scrollableContent}
      </ScrollableList>
    )
  }

}

CommentList.propTypes = {
  descendants: ImmutablePropTypes.list,
  onViewComments: PropTypes.func.isRequired,
  ancestorAccountId: PropTypes.string.isRequired,
  totalDirectDescendants: PropTypes.number,
  ancestorStatusId: PropTypes.string,
  loadedDirectDescendantsCount: PropTypes.number
}

export default CommentList
