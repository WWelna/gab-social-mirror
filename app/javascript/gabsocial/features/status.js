import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import {
  fetchStatus,
  fetchComments,
  fetchContext,
} from '../actions/statuses'
import StatusContainer from '../containers/status_container'
import StatusPlaceholder from '../components/placeholder/status_placeholder'
import WrappedBundle from './ui/util/wrapped_bundle'
import { GabAdStatus } from './ui/util/async_components'

class Status extends ImmutablePureComponent {

  componentDidMount() {
    const statusId = this.props.id || this.props.params.statusId
    this.props.onFetchStatus(statusId)

    if (!!this.props.status) {
      this.shouldFetchStatusParts(this.props.status)
    }
  }

  componentDidUpdate(prevProps) {
    const { status } = this.props

    if (prevProps.status !== status && !!status) {
      this.shouldFetchStatusParts(status)
    }
    if (prevProps.statusId !== this.props.statusId && !this.props.status) {
      this.props.onFetchStatus(this.props.statusId)
    }
  }

  shouldFetchStatusParts = (status) => {
    if (!status) return

    const isComment = !!status.get('in_reply_to_account_id')
    const hasComments = status.get('replies_count') > 0 

    if (isComment) {
      this.props.onFetchContext(status.get('id'))
    } else if (!isComment && hasComments) {
      this.props.onFetchComments(status.get('id'))
    }
  }

  render() {
    const { status } = this.props
  
    if (!status) {
      return <StatusPlaceholder />
    }

    const shouldShowGabAdStatus = status.get('replies_count') < 3

    return (
      <React.Fragment>
        <StatusContainer {...this.props} contextType='feature' />
        {
          shouldShowGabAdStatus &&
          <WrappedBundle component={GabAdStatus} />
        }
      </React.Fragment>
    )
  }

}

const mapStateToProps = (state, props) => {
  const statusId = props.id || props.params.statusId

  return {
    statusId,
    status: state.getIn(['statuses', statusId]),
  }
}

const mapDispatchToProps = (dispatch) => ({
  onFetchStatus: (id) => dispatch(fetchStatus(id)),
  onFetchContext: (id) => dispatch(fetchContext(id)),
  onFetchComments: (id) => dispatch(fetchComments(id)),
})

Status.propTypes = {
  onFetchContext: PropTypes.func.isRequired,
  onFetchStatus: PropTypes.func.isRequired,
  onFetchComments: PropTypes.func.isRequired,
  params: PropTypes.object,
  status: ImmutablePropTypes.map,
}

export default connect(mapStateToProps, mapDispatchToProps)(Status)