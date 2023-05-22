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
    className={[_s.d, _s.noSelect, _s.noUnderline, _s.outlineNone, _s.bgTransparent].join(' ')}
    data-name={name}
    data-reaction={id}
    style={{ width: size, height: size }}
  >
    <img
      draggable='false'
      style={{
        height: size,
        width: size,
        fontFamily: "'object-fit:contain',inherit",
        verticalAlign: 'middle',
        objectFit: 'contain',
        OObjectFit: 'contain',
      }}
      className={_s.noSelect}
      alt={name}
      title={name}
      src={icon}
      data-reaction={id}
    />
  </span>
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