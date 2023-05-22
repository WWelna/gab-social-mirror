import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, defineMessages } from 'react-intl'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import { changeSetting, saveSettings } from '../../actions/settings'
import {
  DEFAULT_THEME,
  DEFAULT_FONT_SIZE,
  FONT_SIZES,
} from '../../constants'
import ModalLayout from './modal_layout'
import Button from '../button'
import Text from '../text'
import Slider from '../slider'
import SettingSwitch from '../setting_switch'
import ResponsiveClassesComponent from '../../features/ui/util/responsive_classes_component'

const messages = defineMessages({
  message: { id: 'display_options.message', defaultMessage: 'Display settings affect your Gab account on this browser. These settings are only visible to you.' },
  title: { id: 'display_options', defaultMessage: 'Customize your view' },
})

/**
 * The DisplayOptions component was originally used in only one place in the
 * modal popup. Later it was exported to be used separately in other pages like
 * Introduction.
 */
class DisplayOptions extends ImmutablePureComponent {

  handleOnFontSizeChange = (value) => {
    const fontSizeNames = Object.keys(FONT_SIZES)
    const index = fontSizeNames[value]

    this.props.onChange('fontSize', index)
  }

  handleOnThemeSelected = (e) => {
    this.props.onChange('theme', e.target.value)
  }

  handleOnRadiusKeyDisabled = (key, checked) => {
    this.props.onChange(key, checked)
  }

  render() {
    const {
      fontSize,
      displayOptionsSettings,
      intl,
      theme,
      onClose,
      showOptions,
      showDone,
    } = this.props

    const fontSizeNames = Object.keys(FONT_SIZES)
    const currentFontSizeIndex = fontSizeNames.indexOf(fontSize)

    // Options and done are optional and hidden on Introduction to simplify
    const optionsOuterClasses = showOptions ? [_s.d, _s.mb15].join(' ') : _s.displayNone

    return (
      <>

        <div className={[_s.d, _s.mb15].join(' ')}>
          <Text align='center' color='secondary' size='medium'>
            {intl.formatMessage(messages.message)}
          </Text>
        </div>

        <div className={[_s.d, _s.mb15].join(' ')}>
          <Text weight='bold' size='small' color='secondary'>
            Font Size
          </Text>
          <div className={[_s.d, _s.radiusSmall, _s.mt10, _s.py15, _s.px15, _s.bgTertiary].join(' ')}>
            <div className={[_s.d, _s.flexRow, _s.aiCenter].join(' ')}>
              <span className={[_s.d, _s.text, _s.cPrimary].join(' ')} style={{fontSize: '12px'}}>
                Aa
              </span>
              <Slider
                min={0}
                value={currentFontSizeIndex}
                max={fontSizeNames.length - 1}
                onInput={this.handleOnFontSizeChange}
                onChange={this.handleOnFontSizeChange}
                className={[_s.flexGrow1, _s.outlineNone, _s.ml15, _s.mr15].join(' ')}
              />
              <span className={[_s.d, _s.text, _s.cPrimary].join(' ')} style={{fontSize: '18px'}}>
                Aa
              </span>
            </div>
          </div>
        </div>

        <div className={optionsOuterClasses}>
          <Text weight='bold' size='small' color='secondary'>
            Options
          </Text>
          <div className={[_s.d, _s.radiusSmall, _s.mt10, _s.py15, _s.px15, _s.bgTertiary].join(' ')}>
            <SettingSwitch
              prefix='displayOptions'
              settings={displayOptionsSettings}
              settingPath={'radiusSmallDisabled'}
              onChange={this.handleOnRadiusKeyDisabled}
              label={'Small Radius Disabled'}
            />

            <SettingSwitch
              prefix='displayOptions'
              settings={displayOptionsSettings}
              settingPath={'radiusCircleDisabled'}
              onChange={this.handleOnRadiusKeyDisabled}
              label={'Circles Disabled'}
            />

            <SettingSwitch
              prefix='displayOptions'
              settings={displayOptionsSettings}
              settingPath={'logoDisabled'}
              onChange={this.handleOnRadiusKeyDisabled}
              label={'Stealth Gab'}
            />

          </div>
        </div>

        <div className={[_s.d, _s.mb10].join(' ')}>
          <Text weight='bold' size='small' color='secondary'>
            Theme
          </Text>
          <div className={[_s.d, _s.radiusSmall, _s.flexRow, _s.flexWrap, _s.mt10, _s.py10, _s.bgTertiary].join(' ')}>

            <ThemeBlock
              title='White'
              value='white'
              checked={theme === 'white'}
              onChange={this.handleOnThemeSelected}
              style={{
                borderColor: '#ececed',
                backgroundColor: '#fff',
                color: '#2d3436',
              }}
            />

            <ThemeBlock
              title='Light'
              value='light'
              checked={theme === 'light'}
              onChange={this.handleOnThemeSelected}
              style={{
                borderColor: '#68D99F',
                backgroundColor: '#fff',
                color: '#2d3436',
              }}
            />

            <ThemeBlock
              title='Muted'
              value='muted'
              checked={theme === 'muted'}
              onChange={this.handleOnThemeSelected}
              style={{
                borderColor: '#424141',
                backgroundColor: '#222',
                color: '#fff',
              }}
            />

            <ThemeBlock
              title='Black'
              value='black'
              checked={theme === 'black'}
              onChange={this.handleOnThemeSelected}
              style={{
                borderColor: '#212020',
                backgroundColor: '#13171b',
                color: '#cccbcb',
              }}
            />

          </div>
        </div>
        {
          showDone &&
          <Button onClick={onClose} isBlock radiusSmall>
            <Text size='medium' color='inherit' align='center' className={_s.px10}>
              Done
            </Text>
          </Button>
        }

      </>
    )
  }

}

const mapStateToProps = (state) => ({
  displayOptionsSettings: state.getIn(['settings', 'displayOptions']),
  fontSize: state.getIn(['settings', 'displayOptions', 'fontSize'], DEFAULT_FONT_SIZE),
  theme: state.getIn(['settings', 'displayOptions', 'theme'], DEFAULT_THEME),
})

const mapDispatchToProps = (dispatch) => ({
  onChange(key, value) {
    dispatch(changeSetting(['displayOptions', key], value))
    dispatch(saveSettings())
  },
})

DisplayOptions.defaultProps = {
  showOptions: true,
  showDone: true,
}

DisplayOptions.propTypes = {
  fontSize: PropTypes.string,
  intl: PropTypes.object.isRequired,
  displayOptionsSettings: ImmutablePropTypes.map,
  theme: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  showOptions: PropTypes.bool,
  showDone: PropTypes.bool
}

DisplayOptions = injectIntl(connect(mapStateToProps, mapDispatchToProps)(DisplayOptions))
export { DisplayOptions }

class ThemeBlock extends React.PureComponent {

  render() {
    const {
      checked,
      onChange,
      title,
      value,
      style,
    } = this.props

    const id = `theme-${value}`

    return (
      <ResponsiveClassesComponent
        classNames={[_s.d, _s.px10, _s.flexGrow1].join(' ')}
        classNamesXS={[_s.d, _s.px10, _s.flexGrow1, _s.w48PC, _s.mb10].join(' ')}
      >
      <label className={[_s.d, _s.w100PC].join(' ')} htmlFor={id}>
        <div
          className={[_s.d, _s.borderBottom6PX, _s.aiCenter, _s.flexRow, _s.py10, _s.px15, _s.radiusSmall].join(' ')}
          style={style}
        >
          <input
            type='radio'
            name='theme'
            value={value}
            id={id}
            checked={checked}
            onChange={onChange}
          />
          <Text
            align='center'
            size='medium'
            weight='bold'
            color='inherit'
            className={[_s.py10, _s.flexGrow1].join(' ')}
          >
            {title}
          </Text>
        </div>
      </label>
      </ResponsiveClassesComponent>
    )
  }

}

ThemeBlock.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  title: PropTypes.string,
  value: PropTypes.string,
  style: PropTypes.object,
}

class DisplayOptionsModal extends React.Component {
  render() {
    const { onClose, intl } = this.props
    return (
      <ModalLayout
        onClose={onClose}
        width={520}
        title={intl.formatMessage(messages.title)}
      >
        <DisplayOptions onClose={onClose}/>
      </ModalLayout>
    )
  }
}

DisplayOptionsModal.propTypes = {
  intl: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
}

export default injectIntl(DisplayOptionsModal)
