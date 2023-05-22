import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { fetchShortcuts } from '../actions/shortcuts'
import Text from '../components/text'
import ColumnIndicator from '../components/column_indicator'
import List from '../components/list'
import Counter from '../components/counter'

class Shortcuts extends ImmutablePureComponent {

  componentDidMount() {
    this.props.onFetchShortcuts()
  }

  render() {
    const {
      isLoading,
      isError,
      shortcuts,
    } = this.props

    if (isError) {
      return <ColumnIndicator type='error' message='Error fetching shortcuts' />
    }

    const listItems = shortcuts.map((s) => {
      if (s.get('shortcut_type') === 'tag') {
        return {
          to: s.get('to'),
          title: (
            <div className={[_s.d, _s.flexRow].join(' ')}>
              <div
                className={[_s.d, _s.circle, _s.bgSecondary, _s.aiCenter, _s.jcCenter, _s.mr15].join(' ')}
                style={{ height: '16px', width: '16px' }}
              >
                <Text size='small' color='secondary'>#</Text>
              </div>
              <Text color='primary' weight='normal'>
                {s.get('title')}
              </Text>
            </div>
          )
        }
      }
      return {
        to: s.get('to'),
        title: s.get('title'),
        count: s.get('unread_count'),
        image: s.get('image'),
        icon: s.get('icon'),
      }
    })

    return (
      <List
        scrollKey='shortcuts'
        emptyMessage='You have no shortcuts'
        items={listItems}
        showLoading={isLoading}
      />
    )
  }

}

const mapStateToProps = (state) => ({
  isError: state.getIn(['shortcuts', 'isError']),
  isLoading: state.getIn(['shortcuts', 'isLoading']),
  shortcuts: state.getIn(['shortcuts', 'items']),
})

const mapDispatchToProps = (dispatch) => ({
  onFetchShortcuts() {
    dispatch(fetchShortcuts())
  },
})

Shortcuts.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  onFetchShortcuts: PropTypes.func.isRequired,
  shortcuts: ImmutablePropTypes.list,
}

export default connect(mapStateToProps, mapDispatchToProps)(Shortcuts)