import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { timelineFetchPaged } from '../../store/timelines'
import { getAccountGallery } from '../../selectors'
import PanelLayout from './panel_layout'
import MediaItem from '../media_item'
import MediaGalleryPanelPlaceholder from '../placeholder/media_gallery_panel_placeholder'

class MediaGalleryPanel extends ImmutablePureComponent {

  load = opts => {
    const { accountId } = this.props
    if (!accountId || accountId === -1) {
      return
    }
    const timelineId = `account:${accountId}:media`
    const endpoint = `/api/v1/accounts/${accountId}/statuses`
    const expandOpts = Object.assign({ endpoint, limit: 9, only_media: true }, opts)
    this.props.dispatch(timelineFetchPaged(timelineId, expandOpts))
  }

  componentDidMount() {
    this.load()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.accountId !== this.props.accountId) {
      this.load()
    }
  }

  render() {
    const {
      account,
      attachments,
      intl,
      isLoading,
    } = this.props

    if (!attachments) return null

    return (
      <PanelLayout
        noPadding
        title={intl.formatMessage(messages.title)}
        headerButtonTitle={!!account ? intl.formatMessage(messages.show_all) : undefined}
        headerButtonTo={!!account ? `/${account.get('acct')}/photos` : undefined}
      >
        <div className={[_s.d, _s.w100PC, _s.pr5, _s.flexRow, _s.flexWrap].join(' ')}>
          {
            !!account && attachments.size > 0 &&
            attachments.slice(0, 9).map(attachment => (
              <MediaItem
                isSmall
                key={attachment.get('id')}
                attachment={attachment}
                account={account}
              />
            ))
          }
          {
            !account || (attachments.size === 0 && isLoading) &&
            <MediaGalleryPanelPlaceholder />
          }
        </div>
      </PanelLayout>
    )
  }

}

const messages = defineMessages({
  title: { id: 'media_gallery_panel.title', defaultMessage: 'Media' },
  show_all: { id: 'media_gallery_panel.all', defaultMessage: 'Show all' },
})

const mapStateToProps = (state, { account }) => {
  const accountId = !!account ? account.get('id') : -1

  return {
    accountId,
    isLoading: state.getIn(['timelines', `account:${accountId}:media`, 'isLoading'], true),
    attachments: getAccountGallery(state, accountId),
  }
}

MediaGalleryPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  accountId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  account: ImmutablePropTypes.map,
  isLoading: PropTypes.bool,
  attachments: ImmutablePropTypes.list.isRequired,
  intl: PropTypes.object.isRequired,
}

export default injectIntl(connect(mapStateToProps)(MediaGalleryPanel))
