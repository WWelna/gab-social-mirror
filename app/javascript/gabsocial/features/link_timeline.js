import React from 'react'
import PropTypes from 'prop-types'
import StatusList from '../components/status_list'
import ResponsiveClassesComponent from './ui/util/responsive_classes_component'
import PreviewCardItem from '../components/preview_card_item'

const LinkTimeline = ({ params }) =>
  (<>
    <ResponsiveClassesComponent
      classNamesSmall={[_s.d, _s.w100PC, _s.pt10].join(' ')}
      classNamesXS={[_s.d, _s.w100PC, _s.pt10].join(' ')}
    >
      <PreviewCardItem id={params.id} isUnlinked />
    </ResponsiveClassesComponent>
    <StatusList
      timelineId={`link:${params.id}`}
      endpoint={`/api/v1/timelines/preview_card/${params.id}`}
      queue
      showAds
    />
  </>
  )

LinkTimeline.propTypes = { params: PropTypes.object }

export default LinkTimeline;
