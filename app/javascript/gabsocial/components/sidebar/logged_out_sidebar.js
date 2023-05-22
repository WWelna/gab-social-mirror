import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, defineMessages } from 'react-intl'
import { me } from '../../initial_state'
import SidebarSectionTitle from '../sidebar_section_title'
import SidebarSectionItem from '../sidebar_section_item'
import SidebarLayout from './sidebar_layout'

class LoggedOutSidebar extends React.PureComponent {

  render() {
    const {
      intl,
      title,
      showBackBtn,
      tabs
    } = this.props

    if (!!me) return null
   
    return (
      <SidebarLayout
        title={title}
        showBackBtn={showBackBtn}
        tabs={tabs}
      >
        <SidebarSectionTitle>{intl.formatMessage(messages.menu)}</SidebarSectionTitle>
        <SidebarSectionItem title='Home' icon='home' to='/' />
        <SidebarSectionItem title='Search' icon='search-alt' to='/search' />
        <SidebarSectionItem title='Groups' icon='group' to='/groups' />
        <SidebarSectionItem title='Feeds' icon='list' to='/feeds' />
        <SidebarSectionItem title='Marketplace' icon='shop' to='/marketplace' />
        <SidebarSectionItem title='News' icon='news' to='/news' />
        <SidebarSectionItem title='About' icon='list' to='/about' />
        
        <SidebarSectionTitle>{intl.formatMessage(messages.explore)}</SidebarSectionTitle>
        <SidebarSectionItem title='Shop' icon='shop' href='https://shop.dissenter.com' />
        <SidebarSectionItem title='Gab TV' icon='tv' href='https://tv.gab.com' />
        <SidebarSectionItem title='Trends' icon='trends' href='https://trends.gab.com' />
      </SidebarLayout>
    )
  }

}

const messages = defineMessages({
  explore: { id: 'explore', defaultMessage: 'Explore' },
  menu: { id: 'menu', defaultMessage: 'Menu' },
})

LoggedOutSidebar.propTypes = {
  intl: PropTypes.object.isRequired,
  title: PropTypes.string,
  showBackBtn: PropTypes.bool,
  tabs: PropTypes.array,
}

export default injectIntl(LoggedOutSidebar)