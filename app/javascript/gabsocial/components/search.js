import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { me } from '../initial_state'
import { CX, SEARCH_TAB_MARKETPLACE, searchTabs } from '../constants'
import { changeSearch, toggleFocused } from '../actions/search'
import Button from './button'
import { parseQuerystring } from '../utils/querystring'

class Search extends React.Component {
  get searchTab() {
    const { pathname } = this.props.location
    const found = searchTabs.find(item => item.to === pathname)
    return found || searchTabs[0]
  }

  get q() {
    const { q } = parseQuerystring({ q: '' })
    return q    
  }

  componentDidMount() {
    if (this.props.location.pathname.startsWith('/search')) {
      const { textbox } = this
      if (textbox) {
        // this wont always focus with dev tools open
        textbox.focus()
        const vlen = this.q.length
        if (vlen > 0) {
          textbox.selectionStart = vlen
          textbox.selectionEnd = vlen
        }
      }
    }
  }

  handleOnChange = evt => this.props.onChange(evt.target.value)

  handleOnFocus = () => this.props.onToggleFocused(true)

  // Blur is deferred because "Cancel" disappears if this goes first.
  handleOnBlur = () => setTimeout(() => this.props.onToggleFocused(false), 30)

  setTextbox = ref => (this.textbox = ref)

  formSubmit = evt => {
    this.props.history.push(`${this.searchTab.to}?q=${this.props.value}`)
    evt.preventDefault()
    return false
  }

  render() {
    const { value = '', focused, isInNav, theme } = this.props
    const highlighted = focused || value.length > 0

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

    return (
      <div className={[_s.d, _s.jcCenter, _s.h53PX].join(' ')}>
        <form className={containerClasses} method="GET" onSubmit={this.formSubmit}>
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
  focused: state.getIn(['search', 'focused']),
  isLoading: state.getIn(['search', 'isLoading']),
  theme: state.getIn(['settings', 'displayOptions', 'theme']),
})

const mapDispatchToProps = (dispatch) => ({
  onChange: (value) => dispatch(changeSearch(value)),
  onToggleFocused: (focused) => dispatch(toggleFocused(focused)),
})

Search.propTypes = { isInNav: PropTypes.bool }

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Search))
