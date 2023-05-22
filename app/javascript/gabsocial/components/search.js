import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'
import get from 'lodash.get'
import { me } from '../initial_state'
import { CX } from '../constants'
import {
  changeSearch,
  clearSearch,
  submitSearch,
  toggleFocused,
} from '../actions/search'
import Button from './button'

class Search extends React.PureComponent {
  textbox = React.createRef()

  get q() {
    const { search } = this.props.location
    const qs = new URLSearchParams(search)
    return qs.get('q') || ''
  }

  get searchPath() {
    let { pathname } = location
    if (pathname.startsWith('/search') === false) {
      pathname = '/search'
    }
    return pathname
  }

  componentDidMount() {
    const { pathname } = this.props.location

    if (pathname.startsWith('/search') === false) {
      return
    }

    const { q } = this
    this.props.onChange(q)
    this.props.onSubmit()

    const { textbox } = this
    if (textbox) {
      // this wont always focus with dev tools open
      textbox.focus()
      const vlen = q.length
      if (vlen > 0) {
        textbox.selectionStart = vlen
        textbox.selectionEnd = vlen
      }
    }
  }

  componentDidUpdate(prevProps) {
    // Navigating "Back" can change the search term
    if (this.props.location !== prevProps.location) {
      const { q } = this
      const { value } = this.props
      if (q !== value) {
        setTimeout(() => {
          this.props.onChange(q)
          this.handleSubmit({ noPush: true })
        }, 10)
      }
    }
  }

  handleOnChange = evt => this.props.onChange(evt.target.value)

  handleOnFocus = () => this.props.onToggleFocused(true)

  // Blur is deferred because "Cancel" disappears if this goes first.
  handleOnBlur = () => setTimeout(() => this.props.onToggleFocused(false), 30)

  setTextbox = n => {
    this.textbox = n
  }

  handleSubmit = opts => {
    const { searchPath } = this
    const { value } = this.props
    // when blank goto /search instead of /search?q=
    let location = value.length > 0 ? `${searchPath}?q=${value}` : searchPath
    if (opts && opts.noPush) {
      // popped, like browser back/fwd
    } else {
      this.props.history.push(location)
    }
    this.props.onSubmit()
  }

  formSubmit = evt => {
    this.handleSubmit()
    evt.preventDefault()
    return false
  }

  render() {
    const {
      value,
      focused,
      submitted,
      onClear,
      isInNav,
      theme,
    } = this.props
    const highlighted = focused || `${value}`.length > 0

    const inputClasses = CX({
      d: 1,
      text: 1,
      outlineNone: 1,
      lineHeight125: 1,
      displayBlock: 1,
      py7: 1,
      bgTransparent: 1,
      cPrimary: 1,
      fs14PX: 1,
      flexGrow1: 1,
      radiusSmall: 1,
      pl15: 1,
      searchInput: 1,
    })

    const isLight = ['light', 'white'].indexOf(theme) > -1

    const containerClasses = CX({
      d: 1,
      searchNavigation: (!highlighted && isInNav && isLight) || (isInNav && theme !== 'light'),
      bgWhite: (highlighted && isInNav && theme === 'light'),
      bgPrimary: !isInNav,
      flexRow: 1,
      radiusSmall: 1,
      aiCenter: 1,
    })

    const prependIconColor = (highlighted || !isInNav || theme === 'white') ? 'brand' : 'white'
    const placeholder = !me ? 'Search Gab' : 'Search for people or groups on Gab'
    const id = 'nav-search'
    const { pathname } = window.location
    const action = pathname.startsWith('/search') ? pathname : '/search'

    return (
      <div className={[_s.d, _s.jcCenter, _s.h53PX].join(' ')}>
        <form className={containerClasses} action={action} method="GET" onSubmit={this.formSubmit}>
          <label className={_s.visiblyHidden} htmlFor={id}>Search</label>
          <input
            id={id}
            name="q"
            className={inputClasses}
            type='text'
            placeholder={placeholder}
            ref={this.setTextbox}
            value={value}
            onChange={this.handleOnChange}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            autoComplete='off'
          />
          <Button
            className={[_s.px10, _s.mr5].join(' ')}
            tabIndex='0'
            title='Submit search'
            backgroundColor='none'
            color={prependIconColor}
            icon='search'
            iconClassName={_s.fillInherit}
            iconSize='16px'
          />
        </form>
      </div>
    )
  }

}

const mapStateToProps = (state) => ({
  value: state.getIn(['search', 'value']),
  action: state.getIn(['search', 'action']),
  focused: state.getIn(['search', 'focused']),
  submitted: state.getIn(['search', 'submitted']),
  theme: state.getIn(['settings', 'displayOptions', 'theme']),
})

const mapDispatchToProps = (dispatch) => ({
  onChange: (value) => dispatch(changeSearch(value)),
  onClear: () => dispatch(clearSearch()),
  onSubmit: () => dispatch(submitSearch()),
  onToggleFocused: focused => dispatch(toggleFocused(focused)),
})

Search.propTypes = {
  value: PropTypes.string.isRequired,
  focused: PropTypes.bool,
  submitted: PropTypes.bool,
  onToggleFocused: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  withOverlay: PropTypes.bool,
  onClear: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isInNav: PropTypes.bool.isRequired,
  theme: PropTypes.string,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Search))
