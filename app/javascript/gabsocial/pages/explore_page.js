import React from 'react'
import PropTypes from 'prop-types'
import PageTitle from '../features/ui/util/page_title'
import ExploreLayout from '../layouts/explore_layout'

class ExplorePage extends React.PureComponent {

  render() {
    const { children, title, showVideos, showSuggestedUsers, showGroups } = this.props

    return (
      <ExploreLayout title={title} showVideos={showVideos} showSuggestedUsers={showSuggestedUsers} showGroups={showGroups}>
        <PageTitle path={title} />
        {children}
      </ExploreLayout>
    )
  }

}

ExplorePage.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default ExplorePage