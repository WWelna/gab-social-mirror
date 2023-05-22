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
    const { status, account } = this.props

    if (!!status) {
      this.shouldFetchStatusParts(status)
    }
    if (!!account) {
      document.title = `${account.get('display_name') || account.get('username')} on Gab: '${status.get('content').substr(0, 50)}…'`
    }
  }

  componentDidUpdate(prevProps) {
    const { status, account } = this.props
    if (prevProps.status !== status && !!status) {
      this.shouldFetchStatusParts(status)
    }
    if (prevProps.statusId !== this.props.statusId && !this.props.status) {
      this.props.onFetchStatus(this.props.statusId)
    }
    if (!!account) {
      document.title = `${account.get('display_name') || account.get('username')} on Gab: '${status.get('content').substr(0, 50)}…'`
    }
  }

  shouldFetchStatusParts = (status) => {
    if (!status) return

    const isComment = !!status.get('in_reply_to_account_id')
    const hasComments = status.get('replies_count') > 0 || status.get('direct_replies_count') > 0

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

    const shouldShowGabAdStatus = status.get('direct_replies_count') < 3

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
  let status = state.getIn(['statuses', statusId])
  let account = status ? state.getIn(['accounts', status.get('account')]) : undefined

  return {
    statusId,
    status,
    account,
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
  account: ImmutablePropTypes.map,  
}

export default connect(mapStateToProps, mapDispatchToProps)(Status)