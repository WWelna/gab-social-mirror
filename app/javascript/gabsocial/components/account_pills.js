import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { makeGetAccount } from '../selectors'
import ResponsiveClassesComponent from '../features/ui/util/responsive_classes_component'
import PillItem from './pill_item'
import DisplayName from './display_name'

/**
 * Renders account pills components
 * @param {array} [props.pills]
 */
class AccountPills extends React.PureComponent {

  render() {
    const { accountPills } = this.props

    return (
      <ResponsiveClassesComponent
        classNames={[_s.d, _s.flexWrap, _s.px5, _s.flexRow].join(' ')}
        classNamesXS={[_s.d, _s.overflowYHidden, _s.overflowXScroll, _s.noScrollbar, _s.pl10, _s.pr15, _s.flexRow].join(' ')}
      >
        {
          !!accountPills &&
          accountPills.map((tab, i) => (
            <PillItem
              key={`pill-item-${i}`}
              title={tab.title}
              onClick={tab.onClick}
              to={tab.to}
              isActive={tab.active}
              appendIcon='close'
              prependImage={tab.prependImage}
            />
          ))
        }
      </ResponsiveClassesComponent>
    )
  }

}

const makeMapStateToProps = (state, { pills }) => {

  const accountPills = pills.map((pill) => {
    let account = state.getIn(['accounts', pill.accountId])
    if (!account) return {}
    return {
      ...pill,
      title: (<DisplayName account={account} noUsername isInline noHover />),
      prependImage: account.get('avatar_static'),
    }
  })

  return { accountPills }
}


AccountPills.propTypes = {
  pills: PropTypes.array,
}

export default connect(makeMapStateToProps)(AccountPills)