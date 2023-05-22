import React from 'react'
import { FormattedMessage } from 'react-intl'
import StatusList from '../components/status_list'
import { homeSorts } from '../constants'

const timelineId = 'home'

const emptyMessage = (
  <FormattedMessage
    id='empty_column.timeline'
    defaultMessage='Your home timeline is empty. Start following other users to receive their content here.'
  />
)

const createParams = ({ sortByValue }) => ({ sort_by_value: sortByValue })

const HomeTimeline = () =>
  (<StatusList
    scrollKey='home_timeline'
    timelineId={timelineId}
    endpoint='/api/v1/timelines/home'
    collectionType='featured'
    emptyMessage={emptyMessage}
    showPromoted
    showInjections
    showAds
    queue
    sorts={homeSorts}
    createParams={createParams}
  />)

export default HomeTimeline;
