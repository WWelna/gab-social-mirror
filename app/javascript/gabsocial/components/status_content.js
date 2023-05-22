import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  openPopoverDeferred,
  cancelPopover,
} from '../actions/popover'
import { isRtl } from '../utils/rtl'
import {
  CX,
  POPOVER_USER_INFO,
} from '../constants'
import Button from './button'
import Icon from './icon'
import Text from './text'

const MAX_HEIGHT = 200

class StatusContent extends ImmutablePureComponent {

  state = {
    hidden: true,
    collapsed: null, // `collapsed: null` indicates that an element doesn't need collapsing, while `true` or `false` indicates that it does (and is/isn't).
  }

  updateOnProps = [
    'status',
    'expanded',
    'collapsable',
    'isComment',
  ]

  // from display_name.js
  handleOnOpenUserInfoPopover(e, accountId) {
    if (!e) return
    this.props.onOpenUserInfoPopover({
      accountId,
      targetRef: e.target,
      position: 'top-start',
      timeout: 1500
    })
  }

  handleOnCancelUserInfoPopover() {
    this.props.onCancelUserInfoPopover()
  }

  _updateStatusLinks() {
    const node = this.node

    if (!node) return

    const links = node.querySelectorAll('a')

    for (let i = 0; i < links.length; ++i) {
      const link = links[i]
      const mention = this.props.status.get('mentions')
        .find(item => link.href === `${item.get('url')}`)
      const hasDataMention = mention !== undefined
      const isLinked = link.classList.contains('linked')
      const isMention = link.classList.contains('mention')
      const isHashtag = link.classList.contains('hashtag')
      if (isLinked && hasDataMention) {
        continue
      }
      // remove unlinked users after they click "untag me"
      if (!hasDataMention && !isHashtag && isLinked && isMention) {
        // unlink, remove attrs
        link.removeAttribute('href')
        link.removeAttribute('rel')
        link.removeAttribute('title')
        link.classList.remove('linked')
        link.classList.remove('mention')
        link.classList.add(_s.unlinked)
        link.classList.remove(_s.cursorPointer)
        continue;
      } 

      link.classList.add('linked')
      link.classList.add(_s.text, _s.cBrand, _s.cursorPointer, _s.inherit)

      if (mention) {
        link.addEventListener('click', this.onMentionClick.bind(this, mention), false)
        link.addEventListener('mouseenter', (e) => this.handleOnOpenUserInfoPopover(e, mention.get('id')), false)
        link.addEventListener('mousemove', (e) => this.handleOnOpenUserInfoPopover(e, mention.get('id')), false)
        link.addEventListener('mouseleave', (e) => this.handleOnCancelUserInfoPopover(), false)
        link.setAttribute('title', mention.get('acct'))
        link.removeAttribute('target')
      } else if (['#', '$'].includes(link.textContent[0])  || (link.previousSibling && link.previousSibling.textContent && link.previousSibling.textContent[link.previousSibling.textContent.length - 1] === '#')) {
        link.addEventListener('click', this.onHashtagClick.bind(this, link.text), false)
        link.removeAttribute('target')
      } else {
        link.setAttribute('title', link.href)
      }
    }

    if (
      this.props.collapsable
      && this.props.onClick
      && this.state.collapsed === null
      && node.clientHeight > MAX_HEIGHT
      && this.props.status.get('spoiler_text').length === 0
    ) {
      this.setState({ collapsed: true })
    }
  }

  componentDidMount() {
    this._updateStatusLinks()
  }

  componentDidUpdate() {
    this._updateStatusLinks()
  }

  onMentionClick = (mention, e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      this.props.history.push(`/${mention.get('acct')}`)
    }
  }

  onHashtagClick = (hashtag, e) => {
    hashtag = hashtag.replace(/^(#|\$)/, '').toLowerCase()

    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      this.props.history.push(`/tags/${hashtag}`)
    }
  }

  handleMouseDown = (e) => {
    this.startXY = [e.clientX, e.clientY]
  }

  handleMouseUp = (e) => {
    if (!this.startXY) return

    const [startX, startY] = this.startXY
    const [deltaX, deltaY] = [Math.abs(e.clientX - startX), Math.abs(e.clientY - startY)]

    if (e.target.localName === 'button' ||
      e.target.localName === 'a' ||
      (e.target.parentNode && (e.target.parentNode.localName === 'button' || e.target.parentNode.localName === 'a'))) {
      return
    }

    if (deltaX + deltaY < 5 && e.button === 0 && this.props.onClick) {
      this.props.onClick()
    }

    this.startXY = null
  }

  handleSpoilerClick = (e) => {
    e.preventDefault()

    if (this.props.onExpandedToggle) {
      // The parent manages the state
      this.props.onExpandedToggle()
    } else {
      this.setState({ hidden: !this.state.hidden })
    }
  }

  handleReadMore = (e) => {
    e.preventDefault()
    this.setState({ collapsed: false })
  }

  setRef = (c) => {
    this.node = c
  }

  getHtmlContent = () => {
    const { status, reblogContent } = this.props

    const properContent = status.get('contentHtml')

    return reblogContent
      ? `${reblogContent} <div>${properContent}</div>`
      : properContent
  }

  render() {
    const {
      collapsable,
      intl,
      isComment,
      status,
    } = this.props
    const { collapsed } = this.state

    if (status.get('content').length === 0) return null

    const directReplyCount = status.get('direct_replies_count')
    const replyCount = status.get('replies_count') || directReplyCount
    const repostCount = status.get('reblogs_count')
    const favoriteCount = status.get('favourites_count')
    const quotesCount = status.get('quotes_count')
    const hasInteractions = favoriteCount > 0 || replyCount > 0 || repostCount > 0 || quotesCount > 0

    const hidden = this.props.onExpandedToggle ? !this.props.expanded : this.state.hidden

    const content = { __html: this.getHtmlContent() }
    const spoilerContent = { __html: status.get('spoilerHtml') }
    const directionStyle = {
      direction: isRtl(status.get('search_index')) ? 'rtl' : 'ltr',
    }

    if (status.get('spoiler_text').length > 0) {
      let mentionsPlaceholder = null

      const mentionLinks = status.get('mentions').map(item => (
        <Button
          isText
          backgroundColor='none'
          to={`/${item.get('acct')}`}
          href={`/${item.get('acct')}`}
          key={item.get('id')}
          className={['mention', _s.mr5, _s.pb5].join(' ')}
        >
          @{item.get('username')}
        </Button>
      )).reduce((aggregate, item) => [...aggregate, item, ' '], [])

      if (hidden) {
        mentionsPlaceholder = (
          <div className={[_s.statusContent, _s.d, _s.aiStart, _s.flexRow, _s.flexWrap].join(' ')}>
            {mentionLinks}
          </div>
        )
      }

      const toggleText = intl.formatMessage(hidden ? messages.show : messages.hide)

      const spoilerContainerClasses = CX({
        d: 1,
        py10: 1,
        borderBottom1PX: !hidden,
        borderColorSecondary: !hidden,
        mb10: !hidden,
      })

      const statusContentClasses = CX({
        statusContent: 1,
        outlineNone: 1,
        displayNone: hidden,
      })

      const containerClasses = CX({
        statusContent: 1,
        px15: !isComment,
        outlineNone: 1,
        mt5: isComment,
      })

      return (
        <div
          ref={this.setRef}
          tabIndex='0'
          className={containerClasses}
          style={directionStyle}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
        >

          <div className={spoilerContainerClasses}>
            <div className={[_s.d, _s.flexRow, _s.mr5].join(' ')}>
              <Icon id='warning' size='14px' className={[_s.cPrimary, _s.mt2, _s.mr5].join(' ')}/>
              <div
                className={[_s.statusContent, _s.outlineNone].join(' ')}
                dangerouslySetInnerHTML={spoilerContent}
                lang={status.get('language')}
              />
            </div>

            <div className={[_s.d, _s.mt10, _s.aiStart].join(' ')}>
              <Button
                isNarrow
                radiusSmall
                backgroundColor='tertiary'
                color='primary'
                tabIndex='0'
                onClick={this.handleSpoilerClick}
              >
                <Text size='small' color='inherit'>
                  {toggleText}
                </Text>
              </Button>
            </div>
          </div>

          {mentionsPlaceholder}

          <div
            tabIndex={!hidden ? 0 : null}
            className={statusContentClasses}
            style={directionStyle}
            dangerouslySetInnerHTML={content}
            lang={status.get('language')}
          />
        </div>
      )
    } else if (this.props.onClick) {
      const containerClasses = CX({ px15: !isComment })

      const statusContentClasses = CX({
        statusContent: 1,
        outlineNone: 1,
        h215PX: collapsed & !isComment,
        h122PX: collapsed && isComment,
        overflowHidden: collapsed,
        mt5: isComment,
        mt10: !hasInteractions && !isComment,
      })

      return (
        <div className={containerClasses}>
          <div
            ref={this.setRef}
            tabIndex='0'
            className={statusContentClasses}
            style={directionStyle}
            dangerouslySetInnerHTML={content}
            lang={status.get('language')}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
          />
          {
            this.state.collapsed && collapsable &&
            <Button
              isText
              underlineOnHover
              color='primary'
              backgroundColor='none'
              className={[_s.py2].join(' ')}
              onClick={this.handleReadMore}
            >
              <Text size='medium' color='inherit' weight='bold'>
                {intl.formatMessage(messages.readMore)}
              </Text>
            </Button>
          }
        </div>
      )
    }

    const containerClasses = CX({
      statusContent: 1,
      outlineNone: 1,
      px15: !isComment,
      // mb15: !isComment,
      mt5: isComment,
    })

    return (
      <div
        tabIndex='0'
        ref={this.setRef}
        className={containerClasses}
        style={directionStyle}
        dangerouslySetInnerHTML={content}
        lang={status.get('language')}
      />
    )
  }

}

const mapDispatchToProps = (dispatch) => ({
  onOpenUserInfoPopover(props) {
    dispatch(openPopoverDeferred(POPOVER_USER_INFO, props))
  },
  onCancelUserInfoPopover() {
    dispatch(cancelPopover())
  }
})

const messages = defineMessages({
  show: { id: 'status.show_more', defaultMessage: 'Show' },
  hide: { id: 'status.show_less', defaultMessage: 'Hide' },
  readMore: { id: 'status.read_more', defaultMessage: 'Read more' },
})

StatusContent.propTypes = {
  status: ImmutablePropTypes.map.isRequired,
  expanded: PropTypes.bool,
  onExpandedToggle: PropTypes.func,
  onClick: PropTypes.func,
  collapsable: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  isComment: PropTypes.bool,
}

export default withRouter(injectIntl(connect(null, mapDispatchToProps)(StatusContent)))
