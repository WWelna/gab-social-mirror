import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ReactSwipeableViews from 'react-swipeable-views'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import {
  CX,
  BREAKPOINT_EXTRA_SMALL,
  GAB_COM_INTRODUCE_YOURSELF_GROUP_ID,
} from '../constants'
import { me } from '../initial_state'
import { saveShownOnboarding } from '../actions/settings'
import { fetchGroupsByTab } from '../actions/groups'
import { saveUserProfileInformation } from '../actions/user'
import Button from '../components/button'
import Divider from '../components/divider'
import FileInput from '../components/file_input'
import GroupListItem from '../components/group_list_item'
import Heading from '../components/heading'
import Icon from '../components/icon'
import Image from '../components/image'
import Input from '../components/input'
import Text from '../components/text'
import Pagination from '../components/pagination'
import ComposeForm from './compose/components/compose_form'
import Responsive from './ui/util/responsive_component'
import { DisplayOptions } from '../components/modal/display_options_modal'
import EditProfileModal from '../components/modal/edit_profile_modal'

const SlideWelcome = () => (
  <div className={[_s.d, _s.w100PC, _s.h100PC].join(' ')}>
    <Image src='/headers/onboarding.png' alt='Welcome to Gab' />

    <div className={[_s.d, _s.px15, _s.py15].join(' ')}>

      <Text size='large'>Gab is the home of free speech online and a place where users shape their own experience. </Text>
      <br />
      <Text size='large'>You will discover many different ideas, people, and topics on Gab.</Text>
      <br />
      <Text size='large'>Follow the people you find interesting and block or mute people you don't want to associate with.</Text>
      <br />
      <Text size='large'>Speak freely, associate freely!</Text>
      <br />
      <Text size='large'>Let's get started!</Text>

    </div>

  </div>
)
SlideWelcome.title = 'Welcome to Gab!'

class SlidePhotos extends ImmutablePureComponent {
  static title = 'Complete your profile'

  render() {
    return (
      <div className={[_s.d, _s.w100PC].join(' ')}>
        <div className={[_s.d, _s.px15, _s.py15, _s.aiCenter].join(' ')}>

          <div className={[_s.d, _s.py10, _s.maxW640PX].join(' ')}>
            <Text size='large' align='center'>Set your cover photo, profile photo and enter your display name so people can find you.</Text>
          </div>

          <EditProfileModal embedded />

        </div>
      </div>
    )
  }

}

class SlideGroups extends ImmutablePureComponent {
  static title = 'Find your people'

  render() {
    const { groupIds } = this.props

    return (
      <div className={[_s.d, _s.w100PC].join(' ')}>
        <div className={[_s.d, _s.py15, _s.aiCenter].join(' ')}>
          <div className={[_s.d, _s.px15, _s.mb15].join(' ')}>
            <Text size='large'>Gab Groups are a great way to connect with people who share your interests. Please select a few groups to get started.</Text>
          </div>

          <div className={[_s.d, _s.w100PC].join(' ')}>
            {
              groupIds.map((groupId, i) => (
                <GroupListItem
                  isAddable
                  isStatic
                  key={`group-collection-item-${i}`}
                  id={groupId}
                  isLast={groupIds.count() - 1 === i}
                />
              ))
            }
          </div>
        </div>
      </div>
    )
  }

}

SlideGroups.propTypes = {
  groupIds: ImmutablePropTypes.list,
}

class SlideFirstPost extends React.PureComponent {
  static title = 'Start a conversation'

  render() {
    const { submitted } = this.props

    return (
      <div className={[_s.d, _s.w100PC].join(' ')}>
        <div className={[_s.d, _s.py15, _s.px15].join(' ')}>
          {
            !submitted &&
            <React.Fragment>
              <Text size='large' className={_s.pb10}>Now let's make your very first Gab post! Please introduce yourself to the Gab community. How did you hear about Gab? What are you interested in?</Text>
              <br />

              <div className={[_s.d, _s.boxShadowBlock, _s.overflowHidden, _s.radiusSmall].join(' ')}>
                <ComposeForm
                  composerId="introduction"
                  formLocation='introduction'
                  groupId={GAB_COM_INTRODUCE_YOURSELF_GROUP_ID}
                  hidePro
                  autoJoinGroup
                />
              </div>
            </React.Fragment>
          }
          {
            submitted &&
            <React.Fragment>
              <Text size='large' align='center'>Your gab was posted!</Text>
              <br />
              <Text size='large' align='center'>Welcome to our community, remember to speak freely.</Text>
              <br />
              <Button
                href='/home'
                onClick={this.props.onNext}
              >
                Finish
              </Button>
            </React.Fragment>
          }

        </div>
      </div>
    )
  }
}


SlideFirstPost.propTypes = {
  submitted: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
}

class SlideDisplayOptions extends React.PureComponent {
  static title = 'Display options'
  render() {
    return (
      <div className={[_s.d, _s.w100PC].join(' ')}>
        <div className={[_s.d, _s.py15, _s.px15].join(' ')}>
          <DisplayOptions showOptions={false} showDone={false}/>
        </div>
      </div>
    )
  }
}

class Introduction extends ImmutablePureComponent {

  state = {
    currentIndex: 0,
    submittedFirstPost: false,
  }

  componentDidMount() {
    // window.addEventListener('keyup', this.handleKeyUp)
    this.props.onFetchFeaturedGroups()
    this.props.onSaveShownOnboarding()
  }

  componentDidUpdate(prevProps) {
    if (!this.state.submittedFirstPost && !prevProps.isSubmitting && this.props.isSubmitting) {
      this.setState({ submittedFirstPost: true })
    }
  }

  componentWillUnmount() {
    // window.addEventListener('keyup', this.handleKeyUp)
  }

  handleDot = (i) => {
    this.setState({ currentIndex: i })
  }

  beforeSlideChanged = index => {
    if (index === 1) {
      // command <EditProfileModal> to save
      window.dispatchEvent(new CustomEvent('profile-save'))
    }
  }

  handlePrev = () => {
    let { currentIndex } = this.state
    this.beforeSlideChanged(currentIndex)
    currentIndex = Math.max(0, currentIndex - 1)
    this.setState({ currentIndex })
  }

  handleNext = () => {
    let { currentIndex } = this.state
    this.beforeSlideChanged(currentIndex)
    currentIndex = Math.min(currentIndex + 1, 4)
    this.setState({ currentIndex })
  }

  handleSwipe = currentIndex =>  this.setState({ currentIndex })

  /* handleKeyUp = ({ key }) => {
    switch (key) {
      case 'ArrowLeft':
        this.handlePrev()
        break
      case 'ArrowRight':
        this.handleNext()
        break
    }
  } */

  render() {
    const { groupIds } = this.props
    const { currentIndex, submittedFirstPost } = this.state

    const slides = [
      <SlideWelcome />,
      <SlidePhotos />,
      <SlideDisplayOptions/>,
      <SlideGroups groupIds={groupIds} />,
      <SlideFirstPost
        submitted={submittedFirstPost}
        onNext={this.handleNext}
      />
    ]
    
    const lastSlideIndex = slides.length - 1
    const slide = slides[currentIndex]
    const { title } = slide.type
    const nextTitle = currentIndex === lastSlideIndex ? 'Finish' : 'Next'

    return (
      <div className={[_s.d, _s.w100PC, _s.maxH80VH].join(' ')}>
        <div className={[_s.d, _s.flexRow, _s.aiCenter, _s.jcCenter, _s.borderBottom1PX, _s.borderColorSecondary, _s.h53PX, _s.px15].join(' ')}>
          <Responsive min={BREAKPOINT_EXTRA_SMALL}>
            <Heading>
              {title}
            </Heading>
          </Responsive>
          <Responsive max={BREAKPOINT_EXTRA_SMALL}>
            <Heading size='h2'>
              {title}
            </Heading>
          </Responsive>
          <div className={[_s.mlAuto].join(' ')}>
            <Button
              href={currentIndex === lastSlideIndex ? '/home' : undefined}
              onClick={this.handleNext}
              className={[_s.px10, _s.aiCenter, _s.flexRow].join(' ')}
              icon={currentIndex !== lastSlideIndex ? 'arrow-right' : undefined}
              iconSize={currentIndex !== lastSlideIndex ? '18px' : undefined}
            >
              {
                currentIndex === lastSlideIndex &&
                <React.Fragment>
                  <Responsive min={BREAKPOINT_EXTRA_SMALL}>
                    <Text color='white' className={_s.px5}>{nextTitle}</Text>
                  </Responsive>
                  <Responsive max={BREAKPOINT_EXTRA_SMALL}>
                    <Text color='white' className={[_s.px5, _s.mr5].join(' ')}>Done</Text>
                    <Icon id='check' size='14px' className={_s.cWhite} />
                  </Responsive>
                </React.Fragment>
              }
            </Button>
          </div>
        </div>

        <ReactSwipeableViews
          index={currentIndex}
          onChangeIndex={this.handleSwipe}
          className={[_s.d, _s.flexNormal, _s.calcH80VH106PX].join(' ')}
          containerStyle={{ width: '100%' }}
          disabled={this.props.swipeDisabled}
        >
          {
            slides.map((page, i) => (
              <div key={i} className={[_s.d, _s.calcH80VH106PX].join(' ')}>
                {page}
              </div>
            ))
          }
        </ReactSwipeableViews>

        <div className={[_s.d, _s.px15, _s.h53PX, _s.aiCenter, _s.jcCenter, _s.borderTop1PX, _s.borderColorSecondary, _s.w100PC, _s.flexRow].join(' ')}>
          <div className={[_s.d, _s.w50PX, _s.mrAuto].join(' ')}>
            {
              currentIndex !== 0 &&
              <Button
                className={_s.opacity05}
                onClick={this.handlePrev}
                icon='arrow-left'
                backgroundColor='none'
                color='primary'
                iconSize='20px'
              />
            }
          </div>
            
          <div className={[_s.d, _s.h100PC, _s.flexGrow1, _s.aiCenter, _s.jcCenter].join(' ')}>
            <Pagination
              count={slides.length}
              activeIndex={currentIndex}
              onClick={this.handleDot}
              color='brand'
            />
          </div>
          
          <Button
            isText
            href={currentIndex === lastSlideIndex ? '/home' : undefined}
            className={[_s.d, _s.w50PX, _s.h100PC, _s.jcCenter, _s.pr0, _s.pl0, _s.mlAuto, _s.opacity05].join(' ')}
            onClick={this.handleNext}
            backgroundColor='none'
            color='brand'
          >
            <Text align='right' color='brand' weight='bold'>{nextTitle}</Text>
          </Button>
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state) => ({
  groupIds: state.getIn(['group_lists', 'featured', 'items']),
  shownOnboarding: state.getIn(['settings', 'shownOnboarding'], false),
  isSubmitting: state.getIn(['compose', 'is_submitting']),
  swipeDisabled: state.getIn(['swipe', 'paused'])
})

const mapDispatchToProps = (dispatch) => ({
  onSaveShownOnboarding: () => dispatch(saveShownOnboarding()),
  onFetchFeaturedGroups: () => dispatch(fetchGroupsByTab('featured')),
  onSaveUserProfileInformation(data) {
    dispatch(saveUserProfileInformation(data))
  },
})

Introduction.propTypes = {
  groupIds: ImmutablePropTypes.list,
  isSubmitting: PropTypes.bool.isRequired,
  shownOnboarding: PropTypes.bool.isRequired,
  onSaveShownOnboarding: PropTypes.func.isRequired,
  onFetchFeaturedGroups: PropTypes.func.isRequired,
  onSaveUserProfileInformation: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(Introduction)
