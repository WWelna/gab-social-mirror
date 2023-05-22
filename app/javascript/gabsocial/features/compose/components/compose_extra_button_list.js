import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  CX,
  BREAKPOINT_EXTRA_SMALL,
  BREAKPOINT_SMALL,
} from '../../../constants'
import Responsive from '../../ui/util/responsive_component'
import ResponsiveClassesComponent from '../../ui/util/responsive_classes_component'
import Text from '../../../components/text'
import EmojiPickerButton from './emoji_picker_button'
import PollButton from './poll_button'
import SchedulePostButton from './schedule_post_button'
import SpoilerButton from './spoiler_button'
import ExpiresPostButton from './expires_post_button'
import RichTextEditorButton from './rich_text_editor_button'
import StatusVisibilityButton from './status_visibility_button'
import UploadButton from './media_upload_button'
 
class ComposeExtraButtonList extends React.PureComponent {

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeyUp, false)
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp)
  }
    
  render() {
    const {
      isMatch,
      edit,
      hidePro,
      isModal,
      formLocation,
      width,
      height,
      feature
    } = this.props

    const isXS = width <= BREAKPOINT_EXTRA_SMALL
    const isStandalone = formLocation === 'standalone'
    const isTimeline = formLocation === 'timeline'
    const isIntroduction = formLocation === 'introduction'
    const small = true

    const containerClasses = CX({
      d: 1,
      w100PC: !feature,
      bgPrimary: 1,
      px5: 1,
      py5: 1,
      borderColorSecondary: 1,
      flexWrap: !feature,
      flexRow: 1,
      jcSpaceAround: !feature,
      maxW450PX: 1,
    })

    return (
      <div className={[_s.d, _s.px10].join(' ')}>
        <div className={containerClasses}>
          <UploadButton small={small} />
          <EmojiPickerButton isMatch={isMatch} small={small} />
          { !edit && <PollButton small={small} /> }
          { !isIntroduction && <StatusVisibilityButton small={small} /> }
          { !isIntroduction && <SpoilerButton small={small} /> }
          { !feature && !hidePro && !edit && <SchedulePostButton small={small} /> }
          { !hidePro && !edit && <ExpiresPostButton small={small} /> }
          { !feature && !hidePro && !isXS && <RichTextEditorButton small={small} /> }
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  width: state.getIn(['settings', 'window_dimensions', 'width']),
  height: state.getIn(['settings', 'window_dimensions', 'height']),
})
  
ComposeExtraButtonList.propTypes = {
  hidePro: PropTypes.bool,
  edit: PropTypes.bool,
  isMatch: PropTypes.bool,
  isModal: PropTypes.bool,
  formLocation: PropTypes.string
}

export default connect(mapStateToProps)(ComposeExtraButtonList)
