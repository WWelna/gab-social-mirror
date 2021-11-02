import React from 'react'
import PropTypes from 'prop-types'
import Text from '../../../components/text'

const ChatConversationsListHeader = ({ title }) => {
  return (
    <div
      className={[_s.d, _s.w100PC, _s.bgPrimary, _s.pl20, _s.py10, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}
    >
      <Text color='secondary' weight='medium'>
        {title}
      </Text>
    </div>
  )
}

ChatConversationsListHeader.propTypes = {
  title: PropTypes.string,
}

export default ChatConversationsListHeader