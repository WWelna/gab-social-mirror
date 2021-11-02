import React from 'react'
import PropTypes from 'prop-types'
import { CX } from '../../constants'
import Heading from '../heading'
import BackButton from '../back_button'
import Button from '../button'
import Icon from '../icon'
import ComposeFormSubmitButton from '../../features/compose/components/compose_form_submit_button'

class ComposeNavigationBar extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object,
  }
  
  render() {
    const { isExternal, isXS } = this.props

    const innerClasses = CX({
      d: 1,
      flexRow: 1,
      saveAreaInsetPT: 1,
      saveAreaInsetPL: 1,
      saveAreaInsetPR: 1,
      w100PC: 1,
      maxW640PX: !isXS,
      mlAuto: !isXS,
      mrAuto: !isXS,
    })

    return (
      <div className={[_s.d, _s.z4, _s.minH53PX, _s.w100PC].join(' ')}>
        <div className={[_s.d, _s.minH53PX, _s.bgNavigation, _s.aiCenter, _s.z3, _s.top0, _s.right0, _s.left0, _s.posFixed].join(' ')} >
        
          <div className={innerClasses}>

            <div className={[_s.d, _s.h53PX, _s.flexRow, _s.aiCenter, _s.ml15, _s.w84PX].join(' ')}>
              {
                isExternal &&
                <h1 className={[_s.d, _s.mr15].join(' ')}>
                  <Button
                    to='/'
                    isText
                    title='Gab'
                    aria-label='Gab'
                    color='none'
                    backgroundColor='none'
                    className={[_s.d, _s.jcCenter, _s.noSelect, _s.noUnderline, _s.h53PX, _s.cursorPointer, _s.px10, _s.mr5].join(' ')}
                  >
                    <Icon id='logo' className={_s.fillNavigationBrand} />
                  </Button>
                </h1>
              }
              {
                !isExternal &&
                <BackButton
                  toHome
                  className={_s.h53PX}
                  iconSize='18px'
                  iconClassName={[_s.mr5, _s.fillNavigation].join(' ')}
                />
              }
            </div>

            <div className={[_s.d, _s.h53PX, _s.flexRow, _s.jcCenter, _s.aiCenter, _s.mlAuto, _s.mrAuto].join(' ')}>
              <Heading size='h1'>
                <span className={[_s.dangerousContent, _s.fs24PX, _s.colorNavigation].join(' ')}>
                  Compose
                </span>
              </Heading>
            </div>

            <div className={[_s.d, _s.h53PX, _s.flexRow, _s.aiCenter, _s.jcEnd, _s.mr15, _s.w84PX].join(' ')}>
              <ComposeFormSubmitButton type='navigation' router={this.context.router} />
            </div>

          </div>

        </div>
      </div>
    )
    
    return (
      <div className={[_s.d, _s.z4, _s.minH53PX, _s.w100PC].join(' ')}>
        <div className={[_s.d, _s.minH53PX, _s.bgNavigation, _s.aiCenter, _s.z3, _s.top0, _s.right0, _s.left0, _s.posFixed].join(' ')} >
        
          <div className={innerClasses}>

            <BackButton
              toHome
              className={[_s.h53PX, _s.pl10, _s.pr10].join(' ')}
              iconSize='18px'
              iconClassName={[_s.mr5, _s.fillNavigation].join(' ')}
            />

            <div className={[_s.d, _s.h53PX, _s.flexRow, _s.jcCenter, _s.aiCenter, _s.mrAuto].join(' ')}>
              <Heading size='h1'>
                <span className={[_s.dangerousContent, _s.fs24PX, _s.colorNavigation].join(' ')}>
                  Compose
                </span>
              </Heading>
            </div>

            <div className={[_s.d, _s.h53PX, _s.flexRow, _s.mlAuto, _s.aiCenter, _s.jcCenter, _s.mr15].join(' ')}>
              <ComposeFormSubmitButton type='navigation' router={this.context.router} />
            </div>

          </div>

        </div>
      </div>
    )
  }

}

ComposeNavigationBar.propTypes = {
  isExternal: PropTypes.bool,
  isXS: PropTypes.bool,
}

export default ComposeNavigationBar