import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { closePopover } from '../../actions/popover'
import { getListOfGroups } from '../../selectors'
import { fetchGroupsByTab } from '../../actions/groups'
import PopoverLayout from './popover_layout'
import List from '../list'
import { CX } from '../../constants'

class ComposePostDesinationPopover extends ImmutablePureComponent {
  componentDidMount() {
    const { groups } = this.props
    if (!groups || groups.size === 0) {
      this.props.onFetchMemberGroups()
    }
  }

  render() {
    const { isXS, groups, groupId } = this.props

    const items = [
      {
        hideArrow: true,
        title: 'Timeline',
        isActive: groupId === null,
        onClick: () => this.props.onSelect(null)
      }
    ]

    groups.forEach(group =>
      items.push({
        hideArrow: true,
        onClick: () => this.props.onSelect(group.get('id')),
        title: group.get('title'),
        isActive: group.get('id') === groupId
      })
    )

    const listWrapperStyles = CX({
      d: 1,
      maxH340PX: !isXS,
      overflowYScroll: !isXS
    })

    return (
      <PopoverLayout
        width={320}
        isXS={isXS}
        onClose={this.props.onClosePopover}
      >
        <div className={listWrapperStyles}>
          <List size={isXS ? 'large' : 'normal'} items={items} />
        </div>
      </PopoverLayout>
    )
  }
}

const mapStateToProps = state => ({
  groups: getListOfGroups(state, { type: 'member' })
})

const mapDispatchToProps = (dispatch, { onDestination }) => ({
  onSelect(groupId) {
    onDestination({ groupId })
    dispatch(closePopover())
  },
  onClosePopover() {
    dispatch(closePopover())
  },
  onFetchMemberGroups() {
    dispatch(fetchGroupsByTab('member'))
  }
})

ComposePostDesinationPopover.propTypes = {
  isXS: PropTypes.bool,
  onClosePopover: PropTypes.func.isRequired,
  onFetchMemberGroups: PropTypes.func.isRequired,
  groups: ImmutablePropTypes.list,
  onDestination: PropTypes.func
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ComposePostDesinationPopover)
