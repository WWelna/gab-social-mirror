import React from 'react'
import PropTypes from 'prop-types'
import PageTitle from '../features/ui/util/page_title'
import Block from '../components/block'
import DefaultLayout from '../layouts/default_layout'

class EmptyPage extends React.PureComponent {

  render() {
    const {
      children,
      title,
      page,
    } = this.props

    return (
      <DefaultLayout
        noRightSidebar
        noComposeButton
        title={title}
        page={page}
        showBackBtn
      >
        <PageTitle path={title} />
        {children}
      </DefaultLayout>
    )
  }

}

EmptyPage.propTypes = {
  title: PropTypes.string,
  page: PropTypes.string,
  children: PropTypes.node,
}

export default EmptyPage