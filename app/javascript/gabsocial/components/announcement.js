import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { BREAKPOINT_EXTRA_SMALL } from '../constants'
import RelativeTimestamp from './relative_timestamp'
import Text from './text'
import Button from './button'
import Icon from './icon'
import DotTextSeperator from './dot_text_seperator'
import ResponsiveComponent from '../features/ui/util/responsive_component'
import ResponsiveClassesComponent from '../features/ui/util/responsive_classes_component'

const Announcement = ({
  title,
  date,
  onDismiss,
  actionTitle,
  actionOnClick,
  actionTo,
  actionHref,
}) => {
  const [isDismissed, setIsDimissed] = useState(false)

  function handleSetIsDismissed() {
    setIsDimissed(true)
  }

  function handleOnClick(e) {
    setIsDimissed(true)
    !!actionOnClick && actionOnClick(e)
  }

  if (isDismissed) {
    return null
  }

  return (
    <div className={[_s.d, _s.mb10].join(' ')}>
      <ResponsiveClassesComponent
        classNames={[_s.d, _s.flexRow, _s.aiCenter, _s.py5, _s.radiusSmall, _s.bgPrimary, _s.boxShadowBlock, _s.minH40PX].join(' ')}
        classNamesXS={[_s.d, _s.flexRow, _s.aiCenter, _s.py5, _s.bgPrimary, _s.boxShadowBlock, _s.minH53PX].join(' ')}
      >
        <ResponsiveComponent min={BREAKPOINT_EXTRA_SMALL}>
          <div className={[_s.d, _s.aiCenter, _s.jcCenter, _s.px5].join(' ')}>
            <Button
              backgroundColor='none'
              className={[_s.bgSubtle_onHover, _s.circle, _s.pl10].join(' ')}
              title='Close'
              onClick={handleSetIsDismissed}
              color='secondary'
              icon='close'
              iconSize='10px'
            />
          </div>
        </ResponsiveComponent>
        <Button
          noClasses
          href={actionHref}
          to={actionTo}
          onClick={handleOnClick}
          className={[_s.d, _s.aiCenter, _s.flexRow, _s.flexWrap, _s.noUnderline, _s.flexGrow1, _s.px10].join(' ')}
        >
          <Text color='primary' className={[_s.maxW80PC].join()}>
            {title}
          </Text>
          {
            !!date && (
              <React.Fragment>
                <DotTextSeperator />
                <Text color='secondary' className={_s.ml5}>
                  <RelativeTimestamp timestamp={date} />
                </Text>
              </React.Fragment>
            )
          }
          <div className={[_s.d, _s.mlAuto, _s.mr5, _s.flexRow, _s.aiCenter, _s.jcCenter].join(' ')}>
            <ResponsiveComponent min={BREAKPOINT_EXTRA_SMALL}>
              <Text color='primary' className={_s.mr5}>
                {actionTitle}
              </Text>
            </ResponsiveComponent>
            <Icon id='angle-right' size='12px' className={[_s.cPrimary, _s.mt2].join(' ')} />
          </div>
        </Button>
      </ResponsiveClassesComponent>
    </div>
  )
}

Announcement.propTypes = {
  title: PropTypes.string,
  date: PropTypes.string,
  onDismiss: PropTypes.func,
  actionTitle: PropTypes.string,
  actionOnClick: PropTypes.func,
  actionTo: PropTypes.string,
  actionHref: PropTypes.string,
}

export default Announcement
