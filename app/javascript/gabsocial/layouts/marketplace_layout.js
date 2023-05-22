import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import {
  CX,
} from '../constants'
import Layout from './layout'

class MarketplaceLayout extends ImmutablePureComponent {

  render() {
    const {
      children,
      title,
      tabs,
      noRightSidebar,
      layout,
      actions,
    } = this.props

    return (
      <Layout
        showGlobalFooter
        showLinkFooterInSidebar
        page='marketplace'
        tabs={tabs}
        title={title}
        noRightSidebar={noRightSidebar}
        layout={layout}
        actions={actions}
      >
        {children}
      </Layout>
    )
  }

}

MarketplaceLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired,
  noRightSidebar: PropTypes.bool,
  layout: PropTypes.array,
}

export default MarketplaceLayout
