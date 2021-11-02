import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'
import { changeCompose } from '../actions/compose'
import PageTitle from '../features/ui/util/page_title'
import ComposeLayout from '../layouts/compose_layout'
import { BREAKPOINT_EXTRA_SMALL } from '../constants'

class ComposePage extends React.PureComponent {

  state = {
    hasQueryParameters: false,
  }

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeyUp, false)

    const search = this.props.location.search
    try {
      const qp = queryString.parse(search)
      const url = `${qp.url || ''}`
      const text = `${qp.text || ''}`

      if (url.length > 0 || text.length > 0) {
        let value = ""
        if (text.length > 0) value += `${text} `
        if (url.length > 0) value += url
        this.props.dispatch(changeCompose(value))
        this.setState({ hasQueryParameters: true })
      }
    } catch (error) {
      // 
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp)
  }

  render() {
    const { children, width } = this.props
    const { hasQueryParameters } = this.state

    const isXS = width <= BREAKPOINT_EXTRA_SMALL

    return (
      <ComposeLayout
        title='Compose'
        isXS={isXS}
        isExternal={hasQueryParameters}
      >
        <PageTitle path='Compose' />
        {children}
      </ComposeLayout>
    )
  }

}

const mapStateToProps = (state) => ({
  width: state.getIn(['settings', 'window_dimensions', 'width']),
})

ComposePage.propTypes = {
  children: PropTypes.node.isRequired,
}

export default withRouter(connect(mapStateToProps)(ComposePage))