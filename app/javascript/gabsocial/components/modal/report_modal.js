import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { OrderedSet } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { changeReportComment, changeReportCategory, submitReport } from '../../actions/reports'
import { expandAccountTimeline } from '../../actions/timelines'
import { makeGetAccount } from '../../selectors'
import ModalLayout from './modal_layout'
import ResponsiveClassesComponent from '../../features/ui/util/responsive_classes_component'
import Button from '../button'
import StatusCheckBox from '../status_check_box'
import Text from '../text'
import Textarea from '../textarea'
import { reportCategories } from '../../initial_state'

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

  handleCategoryChange = (e) => {
    this.props.dispatch(changeReportCategory(e.target.value))
  }

  componentDidMount () {
    this.props.dispatch(expandAccountTimeline(this.props.account.get('id'), { withReplies: true }))
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.account !== nextProps.account && nextProps.account) {
      this.props.dispatch(expandAccountTimeline(nextProps.account.get('id'), { withReplies: true }))
    }
  }

  render () {
    const {
      account,
      comment,
      intl,
      statusIds,
      isDisabled,
      onClose
    } = this.props

    if (!account) return null

    return (
      <ModalLayout
        width={760}
        noPadding
        title={intl.formatMessage(messages.target, {
          target: account.get('acct')
        })}
        onClose={onClose}
      >

        <ResponsiveClassesComponent
          classNames={[_s.d, _s.flexRow].join(' ')}
          classNamesSmall={[_s.d, _s.flexColumnReverse].join(' ')}
        >
          <ResponsiveClassesComponent
            classNames={[_s.d, _s.maxW320PX, _s.py10, _s.px15, _s.borderRight1PX, _s.borderColorSecondary].join(' ')}
            classNamesSmall={[_s.d, _s.w100PC, _s.py10, _s.px15, _s.borderTop1PX, _s.borderColorSecondary].join(' ')}
          >
            <Text color='secondary' size='small'>
              {intl.formatMessage(messages.description)}
            </Text>

            <div className={[_s.mt10, _s.mb10, _s.pt10].join(' ')}>
              <div className={[_s.d, _s.mb10].join(' ')}>
                <Text
                  color='secondary'
                  size='small'
                >
                  {intl.formatMessage(messages.categoryHint)}:
                </Text>
              </div>
              {reportCategories.map(function(category){
                const id = `reporting-category-${category}`
                const value = category

                return (
                  <ResponsiveClassesComponent
                    classNames={[_s.d, _s.mb10].join(' ')}
                    classNamesXS={[_s.d, _s.flexGrow1, _s.mb10].join(' ')}
                    key={category}
                  >
                    <label className={[_s.d, _s.w100PC].join(' ')} htmlFor={id}>
                      <div
                        className={[_s.d, _s.aiCenter, _s.flexRow, _s.px15, _s.radiusSmall, _s.border1PX, _s.borderColorSecondary].join(' ')}
                      >
                        <input
                          type='radio'
                          name='category'
                          value={value}
                          id={id}
                          checked={this.props.category === category}
                          onChange={this.handleCategoryChange}
                        />
                        <Text
                          align='center'
                          size='medium'
                          weight='bold'
                          color='secondary'
                          className={[_s.py10, _s.flexGrow1].join(' ')}
                        >
                          {category}
                        </Text>
                      </div>
                    </label>
                  </ResponsiveClassesComponent>
                )
              }, this)}
            </div>

            <div className={_s.my10}>
              <div className={[_s.d, _s.mb10].join(' ')}>
                <Text color='secondary' size='small'>
                  {intl.formatMessage(messages.commentHint)}:
                </Text>
              </div>

              <Textarea
                placeholder={intl.formatMessage(messages.placeholder)}
                value={comment}
                onChange={this.handleCommentChange}
                onKeyDown={this.handleKeyDown}
                disabled={isDisabled}
                autoFocus
              />
            </div>

            <Button
              isDisabled={isDisabled}
              onClick={this.handleSubmit}
              className={_s.mt10}
            >
              {intl.formatMessage(messages.submit)}
            </Button>
          </ResponsiveClassesComponent>

          <ResponsiveClassesComponent
            classNames={[_s.d, _s.flexNormal, _s.maxH80VH].join(' ')}
            classNamesSmall={[_s.d, _s.w100PC, _s.h260PX].join(' ')}
          >
            <div className={[_s.d, _s.h100PC, _s.overflowYScroll].join(' ')}>
              {
                statusIds.map((statusId) => (
                  <StatusCheckBox id={statusId} key={`reporting-${statusId}`} disabled={isDisabled} />
                ))
              }
            </div>
          </ResponsiveClassesComponent>
        </ResponsiveClassesComponent>

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

  const mapStateToProps = (state) => {
    const accountId = state.getIn(['reports', 'new', 'account_id'])
    const category = state.getIn(['reports', 'new', 'category'])
    const isSubmitting = state.getIn(['reports', 'new', 'isSubmitting'])

    return {
      account: getAccount(state, accountId),
      comment: state.getIn(['reports', 'new', 'comment']),
      statusIds: OrderedSet(state.getIn(['timelines', `account:${accountId}:with_replies`, 'items'])).union(state.getIn(['reports', 'new', 'status_ids'])),
      isDisabled: isSubmitting || !category,
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
}

export default injectIntl(connect(makeMapStateToProps)(ReportModal))
