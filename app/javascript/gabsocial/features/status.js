import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { Map as ImmutableMap } from 'immutable'
import {
  fetchStatus,
  fetchComments,
  fetchContext,
} from '../actions/statuses'
import StatusContainer from '../containers/status_container'
import StatusPlaceholder from '../components/placeholder/status_placeholder'
import WrappedBundle from './ui/util/wrapped_bundle'
import { GabAdStatus } from './ui/util/async_components'
import { strip } from '../utils/html'
import PageTitle from './ui/util/page_title'

const { isMap } = ImmutableMap

class Status extends React.PureComponent {

  componentDidMount() {
    const statusId = this.props.id || this.props.params.statusId
    this.props.onFetchStatus(statusId)    
    const { status, account } = this.props

    if (isMap(status)) {
      this.shouldFetchStatusParts(status)
    }
  }

  componentDidUpdate(prevProps) {
    const { status, account } = this.props
    if (prevProps.status !== this.props.status && !!status) {
      this.shouldFetchStatusParts(status)
    }
    if (prevProps.statusId !== this.props.statusId && !this.props.status) {
      this.props.onFetchStatus(this.props.statusId)
    }
  }

  get documentTitle() {
    const { account, status } = this.props
    if (isMap(account) === false || isMap(status) === false) {
      return
    }
    const username = account.get('display_name') || account.get('username')
    const content = strip(status.get('content', ''))
    const preview = content.substr(0, 50)
    const ellipsis = content.length > 50 ? '…' : ''
    return `${username} on Gab: '${preview}${ellipsis}'`
  }

  shouldFetchStatusParts = (status) => {
    if (!status) return

    const isComment = !!status.get('in_reply_to_account_id')
    const isQuote = !!status.get('quote_of_id')
    const hasComments = status.get('replies_count') > 0 || status.get('direct_replies_count') > 0
    const isOrphaned = status.get('is_reply') && !status.get('in_reply_to_id')

    if (!isOrphaned && (isComment || isQuote)) {
      this.props.onFetchContext(status.get('id'))
    } 
    if (isOrphaned || (!isComment && hasComments)) {
      this.props.onFetchComments(status.get('id'))
    }
  }

  render() {
    const { status } = this.props
  
    if (!status) {
      return <StatusPlaceholder />
    }

    const { documentTitle } = this
    const shouldShowGabAdStatus = status.get('direct_replies_count') < 4

    return (
      <React.Fragment>
        {documentTitle && <PageTitle title={documentTitle} />}
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
  onFetchComments: (id) => {
    dispatch(fetchComments(id))
  },
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
