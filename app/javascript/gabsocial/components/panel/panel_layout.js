import React from 'react'
import PropTypes from 'prop-types'
import Block from '../block'
import Heading from '../heading'
import Button from '../button'
import Text from '../text'

class PanelLayout extends React.PureComponent {

  render() {
    const {
      title,
      subtitle,
      headerButtonTitle,
      headerButtonAction,
      headerButtonTo,
      headerButtonTooltip,
      headerButtonHref,
      headerButtonRef,
      headerButtonTarget,
      headerTitleSize,
      footerButtonTitle,
      footerButtonAction,
      footerButtonTo,
      footerButtonHref,
      noPadding,
      children,
    } = this.props

    return (
      <aside className={[_s.d, _s.mb15].join(' ')}>
        <Block>
          {
            (title || subtitle) &&
            <div className={[_s.d, _s.px15, _s.py10].join(' ')}>
              <div className={[_s.d, _s.flexRow, _s.aiCenter].join(' ')}>
                <Heading size={headerTitleSize ? headerTitleSize : 'h2'}>
                  {title}
                </Heading>
                {
                  (!!headerButtonTitle && (!!headerButtonAction || !!headerButtonTo || !!headerButtonHref || !!headerButtonTooltip)) &&
                  <div className={[_s.d, _s.mlAuto].join(' ')}>
                    <Button
                      isText
                      radiusSmall
                      backgroundColor='none'
                      color='brand'
                      buttonRef={headerButtonRef}
                      to={headerButtonTo}
                      href={headerButtonHref}
                      onClick={headerButtonAction}
                      tooltip={headerButtonTooltip}
                      target={headerButtonTarget}
                      className={[_s.px15, _s.py5, _s.bgSubtle_onHover].join(' ')}
                    >
                      <Text color='inherit' weight='bold'>
                        {headerButtonTitle}
                      </Text>
                    </Button>
                  </div>
                }
              </div>
              {
                subtitle &&
                <Heading size='h4'>
                  {subtitle}
                </Heading>
              }
            </div>
          }

          {
            !noPadding &&
            <div className={[_s.d, _s.px15, _s.py10].join(' ')}>
              {children}
            </div>
          }

          {
            noPadding && children
          }

          {
            (!!footerButtonTitle && (!!footerButtonAction || !!footerButtonTo || !!footerButtonHref)) &&
            <div className={[_s.d, _s.py10, _s.px10].join(' ')}>
              <Button
                radiusSmall
                color='primary'
                backgroundColor='tertiary'
                to={footerButtonTo}
                href={footerButtonHref}
                onClick={footerButtonAction}
                className={[_s.px15, _s.py10, _s.bgSubtle_onHover].join(' ')}
              >
                <Text color='inherit' size='medium' weight='medium' align='center'>
                  {footerButtonTitle}
                </Text>
              </Button>
            </div>
          }
        </Block>
      </aside>
    )
  }

}

PanelLayout.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  headerButtonTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  headerButtonAction: PropTypes.func,
  headerButtonTo: PropTypes.string,
  headerButtonTooltip: PropTypes.string,
  headerButtonHref: PropTypes.string,
  headerButtonRef: PropTypes.func,
  headerButtonTarget: PropTypes.string,
  headerTitleSize: PropTypes.string,
  footerButtonTitle: PropTypes.string,
  footerButtonAction: PropTypes.func,
  footerButtonTo: PropTypes.string,
  footerButtonHref: PropTypes.string,
  noPadding: PropTypes.bool,
}

export default PanelLayout
