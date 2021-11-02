import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { me, proWantsAds } from '../../initial_state'

const GabAdRoot = ({ children, isPro }) => {
  // if pro and doesnt want ads, dont show
  if (isPro && !proWantsAds) return null

  return children
}

const mapStateToProps = (state) => ({
  isPro: state.getIn(['accounts', me, 'is_pro']),
})

GabAdRoot.propTypes = {
  children: PropTypes.func.isRequired,
  isPro: PropTypes.bool,
}

export default connect(mapStateToProps)(GabAdRoot)