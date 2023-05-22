import React from 'react'
import PropTypes from 'prop-types'
import {
  CX,
  BREAKPOINT_EXTRA_SMALL,
} from '../constants'
import { me } from '../initial_state'
import DefaultNavigationBar from '../components/navigation_bar/default_navigation_bar'
import LoggedOutNavigationBar from '../components/navigation_bar/logged_out_navigation_bar'
import FooterBar from '../components/footer_bar'
import Responsive from '../features/ui/util/responsive_component'
import ResponsiveClassesComponent from '../features/ui/util/responsive_classes_component'
import WrappedBundle from '../features/ui/util/wrapped_bundle'
import {
  AboutSidebar,
  GlobalFooter,
  SidebarXS,
} from '../features/ui/util/async_components'

class AboutLayout extends React.PureComponent {

  render() {
    const { children, title } = this.props

    const mainBlockClasses = CX({
      d: 1,
      w1015PX: 1,
      flexRow: 1,
      jcEnd: 1,
      py15: 1,
      mlAuto: !me,
      mrAuto: !me,
    })

    return (
      <div className={[_s.d, _s.w100PC, _s.minH100VH, _s.bgPrimary].join(' ')}>

        <Responsive max={BREAKPOINT_EXTRA_SMALL}>
          <WrappedBundle component={SidebarXS} />
        </Responsive>

        {
          me &&
          <DefaultNavigationBar title={title} />
        }
        {
          !me &&
          <LoggedOutNavigationBar />
        }

        <div className={[_s.d, _s.flexRow, _s.w100PC, _s.flexGrow1].join(' ')}>

          <Responsive min={BREAKPOINT_EXTRA_SMALL}>
            <WrappedBundle component={AboutSidebar} componentParams={{ title }} />
          </Responsive>

          <ResponsiveClassesComponent
            classNames={[_s.d, _s.flexShrink1, _s.flexGrow1].join(' ')}
            classNamesSmall={[_s.d, _s.flexShrink1, _s.flexGrow1].join(' ')}
            classNamesXS={[_s.d, _s.w100PC].join(' ')}
          >
            <main role='main'>

              <ResponsiveClassesComponent
                classNames={mainBlockClasses}
                classNamesXS={[_s.d, _s.w1015PX, _s.jcEnd, _s.pb15].join(' ')}
              >

                <div className={[_s.d, _s.w1015PX, _s.z1].join(' ')}>

                  <Responsive max={BREAKPOINT_EXTRA_SMALL}>
                    <WrappedBundle component={AboutSidebar} componentParams={{ title }} />
                  </Responsive>
      
                  <div className={_s.d}>
                    {children}
                  </div>
                </div>

              </ResponsiveClassesComponent>

            </main>
          </ResponsiveClassesComponent>
        </div>

        <WrappedBundle component={GlobalFooter} />

        <Responsive max={BREAKPOINT_EXTRA_SMALL}>
          <FooterBar />
        </Responsive>
      </div>
    )
  }

}

AboutLayout.propTypes = {
  title: PropTypes.string,
}

export default AboutLayout
