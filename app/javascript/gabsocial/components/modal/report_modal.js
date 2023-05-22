import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { OrderedSet } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { changeReportComment, changeReportCategory, submitReport } from '../../actions/reports'
import { timelineFetchPaged } from '../../store/timelines'
import { makeGetAccount } from '../../selectors'
import ModalLayout from './modal_layout'
import ResponsiveClassesComponent from '../../features/ui/util/responsive_classes_component'
import Button from '../button'
import StatusCheckBox from '../status_check_box'
import Text from '../text'
import Textarea from '../textarea'
import ReportCategoriesSelect from '../report_categories_select'

class ReportModal extends ImmutablePureComponent {

  handleCommentChange = (value) => {
    this.props.dispatch(changeReportComment(value))
  }

  handleSubmit = () => {
    this.props.dispatch(submitReport())
  }

  handleKeyDown = e => {
    if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
      this.handleSubmit()
    }
  }

  handleOnSelectCategory = (e) => {
    this.props.dispatch(changeReportCategory(e.target.value))
  }

  load = () => {
    const accountId = this.props.account.get('id')
    const timelineId = `account:${accountId}`
    const endpoint = `/api/v1/accounts/${accountId}/statuses`
    const withReplies = true
    this.props.dispatch(timelineFetchPaged(timelineId, { endpoint, withReplies }))
  }

  componentDidMount () {
    this.load()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (this.props.account !== nextProps.account && nextProps.account) {
      this.load()
    }
  }

  render () {
    const {
      account,
      comment,
      intl,
      statusIds,
      isDisabled,
      onClose,
    } = this.props

    if (!account) return null

    return (
      <ModalLayout
        width={800}
        noPadding
        title={intl.formatMessage(messages.target, {
          target: `@${account.get('acct')}`,
        })}
        onClose={onClose}
      >

        <div className={[_s.d].join(' ')}>
          <div className={[_s.d, _s.w100PC, _s.py10, _s.px15, _s.borderTop1PX, _s.borderColorSecondary].join(' ')}>
            <Text color='secondary' size='small'>
              {intl.formatMessage(messages.description)}
            </Text>

            <div className={[_s.mt10, _s.mb10].join(' ')}>
              <div className={[_s.d, _s.mb10].join(' ')}>
                <Text color='secondary' size='small'>
                  {intl.formatMessage(messages.categoryHint)}
                </Text>
              </div>
              <ReportCategoriesSelect onSelect={this.handleOnSelectCategory}/>
            </div>

            <Textarea
              placeholder={intl.formatMessage(messages.placeholder)}
              value={comment}
              onChange={this.handleCommentChange}
              onKeyDown={this.handleKeyDown}
              disabled={isDisabled}
              className={[_s.maxH56PX].join(' ')}
              autoFocus
            />

            <Button
              isDisabled={isDisabled}
              onClick={this.handleSubmit}
              className={_s.mt10}
            >
              <Text align='center' weight='bold' size='medium' color='inherit'>
                {intl.formatMessage(messages.submit)}
              </Text>
            </Button>
          </div>

          {
            !!statusIds && statusIds.size > 0 &&
            <div className={[_s.d, _s.borderTop1PX, _s.borderColorSecondary, _s.w100PC].join(' ')}>
              <div className={[_s.d, _s.h100PC, _s.overflowYScroll].join(' ')}>
                {
                  statusIds.map((statusId) => (
                    <StatusCheckBox id={statusId} key={`reporting-${statusId}`} disabled={isDisabled} />
                  ))
                }
              </div>
            </div>
          }
        </div>

      </ModalLayout>
    )
  }

}

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  placeholder: { id: 'report.placeholder', defaultMessage: 'Additional comments (optional)' },
  submit: { id: 'report.submit', defaultMessage: 'Submit' },
  hint: { id: 'report.hint', defaultMessage: 'The report will be sent to your server moderators. You can provide an explanation of why you are reporting this account below:' },
  target: { id: 'report.target', defaultMessage: 'Report {target}' },
  commentHint: { id: 'report.comment_hint', defaultMessage: 'You can provide additional comments below' },
  categoryHint: { id: 'report.category_hint', defaultMessage: 'Choose a category to help our moderators process your report appropriately' },
  description: { id: 'report.description', defaultMessage: 'This report will be sent to the moderation team for review.' },
})

const makeMapStateToProps = () => {
  const getAccount = makeGetAccount()

  const mapStateToProps = (state, { noStatuses }) => {
    const accountId = state.getIn(['reports', 'new', 'account_id'])
    const category = state.getIn(['reports', 'new', 'category'])
    const isSubmitting = state.getIn(['reports', 'new', 'isSubmitting'])
    const statusIds = noStatuses ? null : OrderedSet(
      state.getIn(['timelines', `account:${accountId}`, 'items'])
    ).union(state.getIn(['reports', 'new', 'status_ids']))
    return {
      account: getAccount(state, accountId),
      comment: state.getIn(['reports', 'new', 'comment']),
      statusIds,
      isDisabled: isSubmitting,
      category,
    }
  }

  return mapStateToProps
}

ReportModal.propTypes = {
  isDisabled: PropTypes.bool,
  account: ImmutablePropTypes.map,
  statusIds: ImmutablePropTypes.orderedSet.isRequired,
  comment: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  noStatuses: PropTypes.bool,
}

export default injectIntl(connect(makeMapStateToProps)(ReportModal))
