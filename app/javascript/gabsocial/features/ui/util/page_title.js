import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'
import { APP_NAME } from '../../../constants'
import { loggedIn } from '../../../initial_state'

const checkKeys = ["badge", "path", "title"]

const okayNumber = val =>
  (typeof val === 'string' || typeof val === 'number') &&
  isNaN(parseInt(val)) === false

class PageTitle extends React.PureComponent {

  componentDidMount() {
    this.updatePageTitle(this.props)
  }

  componentDidUpdate(prevProps) {
    if (checkKeys.some(key => !isEqual(prevProps[key], this.props[key]))) {
      this.updatePageTitle()
    }
  }

  // similar to breadcrumbs
  titleFromPath = () => {
    const { path = '' } = this.props
    let realPath = Array.isArray(path) ? path.join(' / ') : path
    return realPath.trim()
  }

  updatePageTitle = () => {
    const { badge, notificationCount, path, title } = this.props
    let op = ''

    if (loggedIn) {
      if (okayNumber(badge) && parseInt(badge) > 0) {
        // badge passed in via a prop
         op = `(${badge})`
      } else if (okayNumber(notificationCount) && parseInt(notificationCount) > 0) {
        // fallback to notification count from redux
         op = `(${notificationCount})`
      }
    }

    if (typeof title === 'string') {
      // title was passed explicitly from the props
      op = `${op} ${title.trim()}`
    } else if (typeof path === 'string' || Array.isArray(path)) {
      // build a title from the path provided in props
      // similar to breadcrumbs
      op = `${op} ${this.titleFromPath()} - ${APP_NAME}`
    } else {
      // fallback to badge + app name
      op = `${op} ${APP_NAME}`
    }

    // in case of mistakes
    op = op.replace(/undefined/g, '')
      .replace(/null/g, '')
      .replace(/\s{2,}/g, ' ') // multiple spaces to one
      .trim()

    document.title = op
  }

  render() {
    return null
  }

}

PageTitle.propTypes = {
  badge: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  path: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  title: PropTypes.string
}

const mapStateToProps = state => ({
  notificationCount: state.getIn(['notifications', 'unread'])
})

export default connect(mapStateToProps)(PageTitle)
