import React from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Block from '../components/block'
import { expandWarnings } from '../actions/warnings'
import BlockHeading from '../components/block_heading'
import ScrollableList from '../components/scrollable_list'
import Warning from '../components/warning'

class Warnings extends ImmutablePureComponent {

  componentDidMount() {
    this.props.onExpandWarnings()
  }

  handleLoadMore = debounce(() => {
    this.props.onExpandWarnings()
  }, 300, { leading: true })

  render() {
    const {
      warnings,
      hasMore,
      isLoading,
    } = this.props

    return (
      <Block>
        <BlockHeading title='Account Warnings' />
        <ScrollableList
          scrollKey='account_warnings'
          onLoadMore={this.handleLoadMore}
          hasMore={false}
          isLoading={isLoading}
          showLoading={isLoading && warnings.size === 0}
          emptyMessage={'You do not have any account warnings'}
          placeholderCount={3}
        >
          {
            warnings && warnings.map((warning) => (
              <Warning
                key={`warning-${warning.get('id')}`}
                warning={warning}
                compact
              />
            ))
          }
        </ScrollableList>
      </Block>
    )
  }

}

const mapStateToProps = (state) => ({
  isError: state.getIn(['warnings', 'isError']),
  isLoading: state.getIn(['warnings', 'isLoading']),
  warnings: state.getIn(['warnings', 'items']),
  hasMore: !!state.getIn(['warnings', 'next']),
})

const mapDispatchToProps = (dispatch) => ({
  onExpandWarnings: () => dispatch(expandWarnings()),
})

Warnings.propTypes = {
  onFetchWarnings: PropTypes.func.isRequired,
  warnings: ImmutablePropTypes.list.isRequired,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
}

export default connect(mapStateToProps, mapDispatchToProps)(Warnings)
