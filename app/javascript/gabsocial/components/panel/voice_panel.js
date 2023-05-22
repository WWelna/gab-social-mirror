import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import PanelLayout from './panel_layout'
import VideoItem from '../video_item'
import Text from '../text'
import { defineMessages, injectIntl } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { isPro } from '../../initial_state'

class VoicePanel extends ImmutablePureComponent {
  render() {
    const { rooms, fqd, intl, isFetched } = this.props

    if (!isFetched) {
      return null
    }

    const hasLiveRooms = rooms && rooms.length
    const noRoomMessage = isPro
      ? intl.formatMessage(messages.noRoomMsgPro)
      : intl.formatMessage(messages.noRoomMsg)

    /**
     * When hitting the Voice /login route, the `returnUrl` parameter
     * will redirect their successful login request to a base64 decoded
     * relative server path.  So atob('L3Jvb20vY3JlYXRl') === '/room/create'
     */
    const noLiveRoomHref = isPro
      ? 'https://voice.gab.com/user/login?returnUrl=L3Jvb20vY3JlYXRl'
      : 'https://pro.gab.com/'
    const footerButtonHref = hasLiveRooms
      ? 'https://voice.gab.com/user/login'
      : noLiveRoomHref
    const noLiveRoomTitle = isPro
      ? intl.formatMessage(messages.create)
      : intl.formatMessage(messages.goPro)
    const footerbuttonTitle = hasLiveRooms
      ? intl.formatMessage(messages.viewMore)
      : noLiveRoomTitle

    return (
      <PanelLayout
        key="voice-public-room-panel"
        noPadding
        title={intl.formatMessage(messages.title)}
        footerButtonTitle={footerbuttonTitle}
        footerButtonHref={footerButtonHref}
      >
        <div
          className={[
            _s.d,
            _s.borderTop1PX,
            _s.borderBottom1PX,
            _s.borderColorSecondary,
            _s.pt10,
            _s.w100PC
          ].join(' ')}
        >
          {(hasLiveRooms &&
            rooms.slice(0, 4).map((room, i) => {
              return (
                <VideoItem
                  id={room.audienceLink}
                  videoUrl={fqd + room.audienceLink}
                  title={room.name}
                  thumbnail={room.thumbnail}
                  created={room.callStartedAt}
                  channelName={room.owner.username}
                  channelAvatar={`/${room.owner.username}/avatar`}
                  views={`${room.membership.current.spectatorCount}`}
                  duration={'LIVE'}
                  key={`gab-voice-public-panel-item-${i}`}
                  viewsText="viewers"
                />
              )
            })) || (
            <div
              className={[
                _s.d,
                _s.w100PC,
                _s.aiCenter,
                _s.py15,
                _s.px15,
                _s.jcCenter
              ].join(' ')}
            >
              <Text>{noRoomMessage}</Text>
            </div>
          )}
        </div>
      </PanelLayout>
    )
  }
}

const messages = defineMessages({
  title: { id: 'gab_voice_explore.title', defaultMessage: 'Gab Voice' },
  viewMore: {
    id: 'gab_voice_explore.viewMore',
    defaultMessage: 'Check out Gab Voice'
  },
  goPro: {
    id: 'gab_voice_explore.goPro',
    defaultMessage: 'Go PRO & Make your own rooms'
  },
  create: {
    id: 'gab_voice_explore.create',
    defaultMessage: 'Create a Voice Room'
  },
  noRoomMsg: {
    id: 'gab_voice_explore.noRoomMsg',
    defaultMessage:
      'No Public Gab Voice rooms are currently LIVE.  Upgrade to Gab PRO to create your own Public Rooms in Gab Voice!'
  },
  noRoomMsgPro: {
    id: 'gab_voice_explore.noRoomMsgPro',
    defaultMessage:
      'No Public Gab Voice rooms are currently LIVE.  Since you are already a Gab PRO user, you can create your own Public Room in Gab Voice!'
  }
})

const mapStateToProps = state => {
  const {
    rooms = [],
    isFetched = false,
    fqd = ''
  } = state.get('voice_pub_rooms')
  return { rooms, fqd, isFetched }
}

VoicePanel.propTypes = {
  isFetched: PropTypes.bool,
  fqd: PropTypes.string,
  rooms: PropTypes.array
}

export default injectIntl(connect(mapStateToProps)(VoicePanel))
