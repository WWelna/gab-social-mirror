import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { fetchShortcuts } from '../actions/shortcuts'
import Image from '../components/image'
import Counter from '../components/counter'
import { NavLink } from 'react-router-dom'

class ShortcutsAvatarList extends ImmutablePureComponent {

  componentDidMount() {
    this.props.onFetchShortcuts()
  }

  render() {
    const { shortcuts } = this.props

    if (!shortcuts || shortcuts.size === 0) return null

    const listItems = shortcuts.filter((s) => {
      const shortcutType = s.get('shortcut_type')
      return ['account', 'group'].indexOf(shortcutType) > -1
    })

    if (!listItems || listItems.size === 0) return null

    return (
      <div
        className={[
          _s.d,
          _s.px10,
          _s.pt10,
          _s.mt5,
          _s.mb5,
          _s.flexRow,
          _s.width100PC,
          _s.overflowHidden,
          _s.overflowXScroll,
          _s.noScrollbar,
        ].join(' ')}
      >
        {listItems.map((s) => (
          <NavLink
            key={`shortcut-avatar-${s.get('id')}`}
            to={s.get('to')}
            className={[_s.d, _s.mr15, _s.h50PX, _s.w50PX, _s.circle, _s.noUnderline, _s.bgSecondary, _s.cursorPointer].join(' ')}
          >
            <Image
              src={s.get('image')}
              className={[_s.h50PX, _s.w50PX, _s.circle].join(' ')}
            />
            <div className={[_s.d, _s.posAbs, _s.top0, _s.right0, _s.mtNeg5PX, _s.mrNeg5PX].join(' ')}>
              <Counter count={s.get('unread_count')} max={99} />
            </div>
          </NavLink>
        ))}
      </div>
    )
  }

}

const mapStateToProps = (state) => ({
  shortcuts: state.getIn(['shortcuts', 'items']),
})

const mapDispatchToProps = (dispatch) => ({
  onFetchShortcuts() {
    dispatch(fetchShortcuts())
  },
})

ShortcutsAvatarList.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  onFetchShortcuts: PropTypes.func.isRequired,
  shortcuts: ImmutablePropTypes.list,
}

export default connect(mapStateToProps, mapDispatchToProps)(ShortcutsAvatarList)