import React from 'react'
import PropTypes from 'prop-types'
import { CX } from '../constants'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import Icon from './icon'

/**
 * Renders a select element with options
 * @param {func} props.onChange - function to call on option selection
 * @param {object} props.options - options for selection
 * @param {string} [props.value] - value to set selected
 */
class Select extends ImmutablePureComponent {

  updateOnProps = [
    'options',
    'value',
  ]

  render() {
    const {
      id,
      value,
      options,
      onChange,
      isSmall,
      isDisabled,
    } = this.props

    const selectClasses = CX({
      d: 1,
      outlineNone: 1,
      text: 1,
      border1PX: 1,
      borderColorSecondary: 1,
      bgPrimary: 1,
      cPrimary: 1,
      px15: 1,
      select: 1,
      fs14PX: 1,
      circle: 1,
      selectSmall: isSmall,
      cursorNotAllowed: isDisabled,
    })

    const iconClasses = CX({
      cSecondary: 1,
      posAbs: 1,
      right0: 1,
      mr10: 1,
      bottom0: 1,
      mb15: !isSmall,
      mb10: isSmall,
    })

    return (
      <div className={_s.d}>
        <select
          id={id}
          disabled={isDisabled}
          className={selectClasses}
          value={value}
          onChange={onChange}
        >
          {
            options.map((option) => (
              <option key={`option-${option.value}`} value={option.value}>
                {option.title}
              </option>
            ))
          }
        </select>
        <Icon
          id='select'
          size='14px'
          className={iconClasses}
        />
      </div>
    )
  }

}

Select.propTypes = {
  id: PropTypes.string,
  isSmall: PropTypes.bool,
  isDisabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.oneOfType([
    ImmutablePropTypes.list,
    PropTypes.array,
  ]).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ])
}

export default Select
