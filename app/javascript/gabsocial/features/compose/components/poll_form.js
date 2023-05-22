import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { defineMessages, injectIntl } from 'react-intl'
import {
  addPollOption,
  removePollOption,
  changePollOption,
  changePollSettings,
} from '../../../actions/compose'
import {
  CX,
  MAX_POLL_OPTOINS,
} from '../../../constants'
import Button from '../../../components/button'
import Text from '../../../components/text'
import Select from '../../../components/select'
import Input from '../../../components/input'

class PollForm extends ImmutablePureComponent {

  handleSelectDuration = (e) => {
    this.props.onChangeSettings(e.target.value)
  }

  render() {
    const {
      options,
      expiresIn,
      onChangeOption,
      onRemoveOption,
      intl,
      onAddOption,
      ...otherProps
    } = this.props

    if (!options) return null

    return (
      <div className={[_s.d, _s.px10, _s.py10, _s.borderColorSecondary, _s.border1PX, _s.radiusSmall].join(' ')}>
        <ul className={[_s.d, _s.listStyleNone].join(' ')}>
          {
            options.map((title, i) => (
              <PollFormOption
                intl={intl}
                title={title}
                key={`poll-form-option-${i}`}
                index={i}
                onChange={onChangeOption}
                onRemove={onRemoveOption}
                {...otherProps}
              />
            ))
          }
        </ul>

        <div className={[_s.d, _s.flexRow].join(' ')}>
          {
            options.size < MAX_POLL_OPTOINS && (
              <Button
                isOutline
                backgroundColor='none'
                color='brand'
                className={[_s.aiCenter, _s.mr10].join(' ')}
                onClick={onAddOption}
                icon='add'
                iconSize='14px'
                iconClassName={_s.mr5}
              >
                <Text color='inherit'>
                  {intl.formatMessage(messages.add_option)}
                </Text>
              </Button>
            )
          }

          <div className={[_s.d, _s.flexGrow1].join(' ')}>
            <Select
              value={expiresIn}
              onChange={this.handleSelectDuration}
              options={[
                {
                  value: 3600,
                  title: intl.formatMessage(messages.hours, { number: 1 }),
                },
                {
                  value: 21600,
                  title: intl.formatMessage(messages.hours, { number: 6 }),
                },
                {
                  value: 86400,
                  title: intl.formatMessage(messages.days, { number: 1 }),
                },
                {
                  value: 259200,
                  title: intl.formatMessage(messages.days, { number: 3 }),
                },
                {
                  value: 604800,
                  title: intl.formatMessage(messages.days, { number: 7 }),
                },
              ]}
            />
          </div>
        </div>
      </div>
    )
  }

}

class PollFormOption extends ImmutablePureComponent {

  handleOptionTitleChange = (value) => {
    this.props.onChange(this.props.index, value)
  }

  handleOptionRemove = () => {
    this.props.onRemove(this.props.index)
  }

  render() {
    const { title, index, intl } = this.props

    const toggleClasses = CX({
      d: 1,
      px10: 1,
      py10: 1,
      borderColorSecondary: 1,
      border1PX: 1,
      outlineNone: 1,
      mr10: 1,
      circle: 1,
    })

    return (
      <li className={[_s.d, _s.flexRow, _s.mb10].join(' ')}>
        <label className={[_s.d, _s.flexRow, _s.flexGrow1, _s.aiCenter].join(' ')}>
          <span
            className={toggleClasses}
            role='button'
            tabIndex='0'
          />

          <Input
            id='poll-input'
            placeholder={intl.formatMessage(messages.option_placeholder, { number: index + 1 })}
            maxLength={160}
            value={title}
            onChange={this.handleOptionTitleChange}
          />
        </label>

        {
          index > 1 &&
          <Button
            isNarrow
            backgroundColor='none'
            className={[_s.ml5, _s.jcCenter].join(' ')}
            icon='close'
            iconSize='8px'
            iconClassName={_s.cSecondary}
            disabled={index <= 1}
            title={intl.formatMessage(messages.remove_option)}
            onClick={this.handleOptionRemove}
          />
        }
      </li>
    )
  }

}

PollFormOption.propTypes = {
  title: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
}

const messages = defineMessages({
  option_placeholder: { id: 'compose_form.poll.option_placeholder', defaultMessage: 'Choice {number}' },
  add_option: { id: 'compose_form.poll.add_option', defaultMessage: 'Add a choice' },
  remove_option: { id: 'compose_form.poll.remove_option', defaultMessage: 'Remove this choice' },
  poll_duration: { id: 'compose_form.poll.duration', defaultMessage: 'Poll duration' },
  minutes: { id: 'intervals.full.minutes', defaultMessage: '{number, plural, one {# minute} other {# minutes}}' },
  hours: { id: 'intervals.full.hours', defaultMessage: '{number, plural, one {# hour} other {# hours}}' },
  days: { id: 'intervals.full.days', defaultMessage: '{number, plural, one {# day} other {# days}}' },
})

const mapStateToProps = (state) => ({
  options: state.getIn(['compose', 'poll', 'options']),
  expiresIn: state.getIn(['compose', 'poll', 'expires_in']),
})

const mapDispatchToProps = (dispatch) => ({
  onAddOption() {
    dispatch(addPollOption(''))
  },

  onRemoveOption(index) {
    dispatch(removePollOption(index))
  },

  onChangeOption(index, title) {
    dispatch(changePollOption(index, title))
  },

  onChangeSettings(expiresIn, isMultiple) {
    dispatch(changePollSettings(expiresIn, isMultiple))
  },

})

PollForm.propTypes = {
  options: ImmutablePropTypes.list,
  expiresIn: PropTypes.number,
  onChangeOption: PropTypes.func.isRequired,
  onAddOption: PropTypes.func.isRequired,
  onRemoveOption: PropTypes.func.isRequired,
  onChangeSettings: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(PollForm))
