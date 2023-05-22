import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import noop from 'lodash/noop'

const emptyComponent = () => null

class Bundle extends React.PureComponent {

  static cache = new Map

  state = {
    mod: undefined,
    forceRender: false,
  }

  componentDidMount() {
    this.load(this.props)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.fetchComponent !== this.props.fetchComponent) {
      this.load(nextProps)
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }

  load = (props) => {
    const { fetchComponent, renderDelay } = props || this.props
    const cachedMod = Bundle.cache.get(fetchComponent)

    if (fetchComponent === undefined) {
      this.setState({ mod: null })
      return Promise.resolve()
    }

    if (cachedMod) {
      this.setState({ mod: cachedMod.default })
      return Promise.resolve()
    }

    this.setState({ mod: undefined })

    if (renderDelay !== 0) {
      this.timestamp = new Date()
      this.timeout = setTimeout(() => this.setState({
        forceRender: true
      }), renderDelay)
    }

    return fetchComponent()
      .then((mod) => {
        Bundle.cache.set(fetchComponent, mod)
        this.setState({
          mod: mod.default
        })
      })
      .catch(error => {
        const { message, stack } = error
        console.error('Bundle error', message, stack)
        this.setState({ mod: null })
      })
  }

  render() {
    const {
      loading: LoadingComponent,
      error: ErrorComponent,
      children,
      renderDelay
    } = this.props

    const { mod, forceRender } = this.state
    const elapsed = this.timestamp ? (new Date() - this.timestamp) : renderDelay

    if (mod === undefined) {
      return (elapsed >= renderDelay || forceRender) ? <LoadingComponent /> : null
    } else if (mod === null) {
      return <ErrorComponent onRetry={this.load} />
    }

    return children(mod)
  }

}

Bundle.propTypes = {
  fetchComponent: PropTypes.func,
  loading: PropTypes.func,
  error: PropTypes.func,
  children: PropTypes.func.isRequired,
  renderDelay: PropTypes.number
}

Bundle.defaultProps = {
  loading: emptyComponent,
  error: emptyComponent,
  renderDelay: 0
}

export default Bundle
