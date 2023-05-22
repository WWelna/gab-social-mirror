import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import TimelineInjectionLayout from './timeline_injection_layout'
import VideoItem from '../video_item'

class VoicePublicRoomsInjection extends ImmutablePureComponent {
  render() {
    const { rooms, isFetched, fqd, isXS, injectionId } = this.props

    if (!isFetched || !rooms || !rooms.length || !rooms.slice) {
      return null
    }

    return (
      <TimelineInjectionLayout
        id={injectionId}
        isXS={isXS}
        showMenu={false}
      >
        {rooms.slice(0, 8).map((room, i) => (
          <VideoItem
            id={room.audienceLink}
            videoUrl={fqd + room.audienceLink}
            title={room.name}
            thumbnail={room.thumbnail}
            created={room.callStartedAt}
            channelName={room.owner.username}
            channelAvatar={`/${room.owner.username}/avatar`}
            views={room.membership.current.spectatorCount}
            duration={'LIVE'}
            key={`gab-voice-item-${i}`}
            viewsText="viewers"
          />
        ))}
      </TimelineInjectionLayout>
    )
  }
}

const mapStateToProps = state => state.get('voice_pub_rooms')

VoicePublicRoomsInjection.propTypes = {
  rooms: PropTypes.array,
  isFetched: PropTypes.bool,
  isLoading: PropTypes.bool,
  injectionId: PropTypes.string
}

export default connect(mapStateToProps)(VoicePublicRoomsInjection)
