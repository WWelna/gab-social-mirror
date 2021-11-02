import React from 'react'
import PropTypes from 'prop-types'
import { me } from '../initial_state'
import { CX } from '../constants'
import ComposeNavigationBar from '../components/navigation_bar/compose_navigation_bar_xs'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import { GlobalFooter } from '../features/ui/util/async_components'

class ComposeLayout extends React.PureComponent {

  render() {
    const { children, isExternal, isXS } = this.props
    
    const mainClasses = CX({
      d: 1,
      w100PC: 1,
      flexGrow1: 1,
      borderRight1PX: !isXS,
      borderLeft1PX: !isXS,
      borderColorSecondary: !isXS,
    })

    return (
      <div className={[_s.d, _s.w100PC, _s.minH100VH, _s.bgTertiary].join(' ')}>
        <ComposeNavigationBar isXS={isXS} isExternal={isExternal} />
        <div className={[_s.d, _s.w100PC, _s.maxW640PX, _s.mlAuto, _s.mrAuto].join(' ')}>
          <main role='main' className={mainClasses}>
            { children }
          </main>
        </div>
        { isExternal && <WrappedBundle component={GlobalFooter} /> }
      </div>
    )
  }

}

ComposeLayout.propTypes = {
  children: PropTypes.node,
  isExternal: PropTypes.bool,
  isXS: PropTypes.bool,
}

export default ComposeLayout