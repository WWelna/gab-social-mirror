/*

Statuses liked by the logged-in user.

*/

import React from 'react'
import { FormattedMessage } from 'react-intl'
import StatusList from '../components/status_list'

const timelineId = 'liked_statuses'

const emptyMessage = (
  <FormattedMessage
    id='empty_column.liked_statuses'
    defaultMessage="You don't have any liked gabs yet. When you like one, it will show up here."
  />
)

const LikedStatuses = () =>
  (<StatusList
    timelineId={timelineId}
    endpoint='/api/v1/favourites'
    emptyMessage={emptyMessage}
  />)

export default LikedStatuses;
