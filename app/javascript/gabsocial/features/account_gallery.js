import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { injectIntl, FormattedMessage } from 'react-intl'
import { timelineFetchPaged } from '../store/timelines'
import { getAccountGallery } from '../selectors'
import MediaItem from '../components/media_item'
import Heading from '../components/heading'
import Block from '../components/block'
import ScrollableList from '../components/scrollable_list'
import MediaGalleryPlaceholder from '../components/placeholder/media_gallery_placeholder'
import ColumnIndicator from '../components/column_indicator'

const emptyMessage = (
  <FormattedMessage
    id='account_gallery.none'
    defaultMessage='No media to show.'
  />
)

class AccountGallery extends ImmutablePureComponent {

  load = opts => {
    const { accountId, mediaType, maxId } = this.props
    if (!accountId || accountId === -1) {
      return
    }
    const timelineId = `account:${accountId}:media`
    const endpoint = `/api/v1/accounts/${accountId}/statuses`
    const limit = 15
    const expandOpts = Object.assign({ endpoint, mediaType, limit, maxId }, opts)
    this.props.dispatch(timelineFetchPaged(timelineId, expandOpts))
  }

  componentDidMount() {
    this.load()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.accountId && prevProps.accountId !== this.props.accountId) {
      this.load()
    }
  }

  render() {
    const {
      attachments = [],
      isLoading,
      isFetched,
      mediaType,
      hasNext,
      account,
      title,
      accountId,
    } = this.props

    if (!account) return null

    return (
      <Block>
        <div className={[_s.d, _s.px10, _s.py10].join(' ')}>
          <Heading size='h2'>{title}</Heading>
        </div>
        <ScrollableList
          scrollKey={`account-gallery-timeline-${accountId}`}
          onLoadMore={this.load}
          isLoading={isLoading}
          hasMore={hasNext}
          emptyMessage={emptyMessage}
          placeholderComponent={MediaGalleryPlaceholder}
          placeholderCount={3}
        >
          {attachments.size === 0 && isFetched && <ColumnIndicator type='missing' message={`The user hasn't posted a ${mediaType}.`}/>}
          <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {
              attachments.map((attachment, index) => (
                <MediaItem
                  key={`attachment-${attachment.get('id')}`}
                  attachment={attachment}
                  account={account}
                />
              ))
            }
          </div>
        </ScrollableList>
      </Block>
    )
  }

}

const mapStateToProps = (state, { account, mediaType }) => {
  const accountId = account.get('id')
  const timeline = state.getIn(['timelines', `account:${accountId}:media`])
  if (timeline === undefined) return { accountId, isLoading: true }
  const items = timeline.get('items').toJS()
  let maxId;
  if (Array.isArray(items) && items.length > 0) {
    maxId = items.pop()
  }
  return {
    accountId,
    attachments: getAccountGallery(state, accountId, mediaType),
    isLoading: timeline.get('isLoading'),
    isFetched: timeline.get('isFetched'),
    hasNext: timeline.get('hasNext'),
    maxId,
  }
}

AccountGallery.propTypes = {
  account: ImmutablePropTypes.map,
  accountId: PropTypes.string,
  attachments: ImmutablePropTypes.list,
  isLoading: PropTypes.bool,
  hasNext: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  mediaType: PropTypes.oneOf(['photo', 'video']).isRequired,
  title: PropTypes.string,
}

export default injectIntl(connect(mapStateToProps)(AccountGallery))
