import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { injectIntl, defineMessages } from 'react-intl'
import { me } from '../initial_state'
import ComposeFormContainer from '../features/compose/containers/compose_form_container'
import ResponsiveClassesComponent from '../features/ui/util/responsive_classes_component'

class TimelineComposeBlock extends ImmutablePureComponent {

  render() {
    const {
      formLocation,
      account,
      size,
      intl,
      isModal,
      groupId,
      ...rest
    } = this.props


    if (isModal) {
      return (
        <section className={_s.d}>
          <div className={[_s.d, _s.flexRow].join(' ')}>
            <ComposeFormContainer {...rest} isModal={isModal} formLocation={formLocation} groupId={groupId} />
          </div>
        </section>
      )
    }

    return (
      <section className={[_s.d, _s.mb15].join(' ')}>
        <ResponsiveClassesComponent
          classNames={[_s.d, _s.boxShadowBlock, _s.bgPrimary, _s.overflowHidden, _s.radiusSmall].join(' ')}
          classNamesXS={[_s.d, _s.mt15, _s.boxShadowBlock, _s.bgPrimary, _s.overflowHidden].join(' ')}
        >
          <ComposeFormContainer {...rest} formLocation={formLocation} groupId={groupId} />
        </ResponsiveClassesComponent>
      </section>
    )
  }

}

const messages = defineMessages({
  createPost: { id: 'column_header.create_post', defaultMessage: 'Create Post' },
})

const mapStateToProps = (state) => ({
  account: state.getIn(['accounts', me]),
})

TimelineComposeBlock.propTypes = {
  intl: PropTypes.object.isRequired,
  account: ImmutablePropTypes.map.isRequired,
  size: PropTypes.number,
  isModal: PropTypes.bool,
  formLocation: PropTypes.string,
  groupId: PropTypes.string,
}

TimelineComposeBlock.defaultProps = {
  size: 32,
  formLocation: 'timeline',
}

export default injectIntl(connect(mapStateToProps)(TimelineComposeBlock))