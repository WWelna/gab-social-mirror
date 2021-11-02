import React from 'react'
import PropTypes from 'prop-types'
import Button from './button'
import Text from './text'
import Icon from './icon'

class CommentSubReplyLoadMoreButton extends React.PureComponent {

  state = {
    showLoading: false,
  }

  componentDidUpdate (prevProps) {
    if (prevProps.replyCount <= this.props.replyCount) {
      this.setState({ showLoading: false })
    }
  }

  handleOnClick = () => {
    this.setState({ showLoading: true })
    this.props.onClick()
  }

  render() {
    const { shouldShow, replyCount } = this.props
    const { showLoading } = this.state

    if (!shouldShow) return null

    return (
      <div className={[_s.d, _s.flexRow, _s.pl50, _s.pb2, _s.mt5, _s.aiCenter].join(' ')}>
        <Button
          isText
          isBlock
          backgroundColor='none'
          color='tertiary'
          onClick={this.handleOnClick}
          isDisabled={showLoading}
          className={[_s.underline_onHover, _s.pb5, _s.pt5].join(' ')}
        >
          { showLoading && <Icon id='loading' size='20px' className={_s.mr10} /> }
          <Text weight='bold' color='inherit' size='medium'>
            {`View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
          </Text>
        </Button>
      </div>
    )
  }

}

CommentSubReplyLoadMoreButton.propTypes = {
  shouldShow: PropTypes.bool,
  onClick: PropTypes.func,
  replyCount: PropTypes.number,
}

export default CommentSubReplyLoadMoreButton