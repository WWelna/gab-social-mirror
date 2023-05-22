import React from 'react'
import PropTypes from 'prop-types'
import Bundle from '../features/ui/util/bundle'

class SidebarPanelGroup extends React.PureComponent {
  render() {
    const { layout } = this.props

    if (!Array.isArray(layout)) return null

    return (
      <React.Fragment>
        {layout.map((panel, i) => {
          if (!panel) return null

          if (
            typeof panel !== 'function' ||
            panel.key === 'status-promotion-panel'
          ) {
            return panel
          }

          return (
            <Bundle
              key={`sidebar-panel-group-item-${i}`}
              fetchComponent={panel}
              loading={this.renderLoading}
              error={this.renderError}
            >
              {Component => <Component />}
            </Bundle>
          )
        })}
      </React.Fragment>
    )
  }
}

SidebarPanelGroup.propTypes = {
  layout: PropTypes.array.isRequired,
  page: PropTypes.string.isRequired
}

export default SidebarPanelGroup
