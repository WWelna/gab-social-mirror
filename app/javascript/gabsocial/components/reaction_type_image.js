import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { allReactions } from '../initial_state'

const ReactionTypeImage = ({
  id,
  name,
  slug,
  icon,
  size = '14px',
}) => (
  <span
    key={`reaction-${slug}`}
    className={[_s.d, _s.noSelect, _s.pointerEventsNone, _s.noUnderline, _s.outlineNone, _s.bgTransparent].join(' ')}
    data-name={name}
    aria-label={name}
    role='img'
    style={{
      width: size,
      height: size,
      backgroundImage: `url(${icon})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  />
)

const mapStateToProps = (state, { reactionTypeId }) => {
  const reaction = allReactions.find(r => r.id == (reactionTypeId == "true" ? 1 : reactionTypeId))
  if (!reaction) return {}

  return {
    id: reaction.id,
    name: reaction.name,
    slug: reaction.slug,
    icon: reaction.icon,
  }
}

ReactionTypeImage.propTypes = {
  reactionTypeId: PropTypes.string,
  name: PropTypes.string,
  slug: PropTypes.string,
  icon: PropTypes.string,
}


export default connect(mapStateToProps)(ReactionTypeImage)