import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { me } from '../initial_state'
import { openModal } from '../actions/modal'
import { openPopover } from '../actions/popover'
import {
  CX,
  BREAKPOINT_EXTRA_SMALL,
  POPOVER_CHAT_SETTINGS,
  MODAL_CHAT_CONVERSATION_CREATE,
} from '../constants'
import Layout from './layout'
import Responsive from '../features/ui/util/responsive_component'
import ResponsiveClassesComponent from '../features/ui/util/responsive_classes_component'
import ChatSettingsSidebar from '../features/messages/components/chat_settings_sidebar'
import ChatApprovedConversationsSidebar from '../features/messages/components/chat_approved_conversations_sidebar'
import FooterBar from '../components/footer_bar'
import DefaultNavigationBar from '../components/navigation_bar/default_navigation_bar'
import ChatNavigationBar from '../components/navigation_bar/chat_navigation_bar_xs'
import ChatMessageScrollingList from '../features/messages/components/chat_message_scrolling_list'
import ChatMessageComposeForm from '../features/messages/components/chat_message_compose_form'
import ChatConversationRequestApproveBar from '../features/messages/components/chat_conversation_request_approve_bar'

class MessagesLayout extends React.PureComponent {

  handleOpenSettingsOptionsPopover = () => {
    this.props.onOpenSettingsOptionsPopover()
  }

  onClickAdd = () => {
    this.props.onOpenChatConversationCreateModal()
  }

  render() {
    const {
      width,
      title,
      children,
      isSettings,
      showBackBtn,
      source,
      isRequest,
      selectedChatConversationId,
    } = this.props

    const isXS = width <= BREAKPOINT_EXTRA_SMALL

    if (isXS) {
      if (!selectedChatConversationId && !isSettings) {
        return (
          <div className={[_s.d, _s.w100PC, _s.minH100VH, _s.bgTertiary].join(' ')}>
            <DefaultNavigationBar
              showBackBtn
              actions={[
                {
                  icon: 'add',
                  to: '/messages/new',
                },
                {
                  icon: 'cog',
                  onClick: this.handleOpenSettingsOptionsPopover,
                }
              ]}
              title={title}
            />
            <main role='main' className={[_s.d, _s.w100PC, _s.flexGrow1, _s.bgPrimary, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
              <div className={[_s.d, _s.w100PC, _s.flexRow, _s.pb15].join(' ')}>
                {
                  (isSettings || isRequest) &&
                  <ChatSettingsSidebar isXS />
                }
                {
                  !isSettings && !isRequest &&
                  <ChatApprovedConversationsSidebar source={source} />
                }
              </div>
              <FooterBar />
            </main> 
          </div>
        )
      } else if (selectedChatConversationId && !isSettings) {
        return (
          <div className={[_s.d, _s.w100PC, _s.minH100VH, _s.bgTertiary].join(' ')}>
            <ChatNavigationBar chatConversationId={selectedChatConversationId} />
            <main role='main' className={[_s.d, _s.w100PC, _s.flexGrow1, _s.bgPrimary].join(' ')}>
              <ChatMessageScrollingList chatConversationId={selectedChatConversationId} isXS={isXS} />
            </main>
            { !isRequest && <ChatMessageComposeForm chatConversationId={selectedChatConversationId} isXS={isXS} /> }
            { isRequest && <ChatConversationRequestApproveBar chatConversationId={selectedChatConversationId} isXS={isXS} /> }
          </div>
        )
      } else {
        return (
          <div className={[_s.d, _s.w100PC, _s.minH100VH, _s.bgTertiary].join(' ')}>
            <DefaultNavigationBar showBackBtn title={title} />
            <main role='main' className={[_s.d, _s.w100PC, _s.flexGrow1, _s.bgPrimary, _s.borderBottom1PX, _s.borderColorSecondary].join(' ')}>
              <div className={[_s.d, _s.w100PC, _s.flexRow, _s.flexGrow1, _s.mb15].join(' ')}>
                {children}
              </div>
              <FooterBar />
            </main> 
          </div>
        )
      }
    }

    return (
      <Layout
        showBackBtn
        noRightSidebar
        noComposeButton
        showGlobalFooter
        showLinkFooterInSidebar
        page='messages'
        title='Chats'
        actions={[
          {
            icon: 'cog',
            to: '/messages/requests',
          },
          {
            icon: 'pencil',
            onClick: () => this.onClickAdd(),
          },
        ]}
      >
        <div className={[_s.d, _s.flexRow, _s.boxShadowNone, _s.w100PC, _s.calcH53PX].join(' ')}>
          <ResponsiveClassesComponent
            classNames={[_s.d, _s.flexShrink1, _s.flexGrow1].join(' ')}
            classNamesSmall={[_s.d, _s.flexShrink1, _s.flexGrow1].join(' ')}
            classNamesXS={[_s.d, _s.w100PC].join(' ')}
          >
            <ResponsiveClassesComponent
              classNames={[_s.d, _s.w1015PX, _s.h100PC, _s.flexRow, _s.jcEnd].join(' ')}
              classNamesXS={[_s.d, _s.w100PC, _s.h100PC, _s.jcEnd].join(' ')}
            >
              {
                (isSettings || isRequest) &&
                <ChatSettingsSidebar />
              }
              {
                !isSettings && !isRequest &&
                <ChatApprovedConversationsSidebar source={source} />
              }
              <div className={[_s.d, _s.flexGrow1, _s.h100PC, _s.bgPrimary, _s.borderColorSecondary, _s.borderRight1PX, _s.z1].join(' ')}>
                <div className={[_s.d, _s.w100PC, _s.h100PC].join(' ')}>
                  {children}
                </div>
              </div>
            </ResponsiveClassesComponent>
          </ResponsiveClassesComponent>
        </div>
      </Layout>
    )
  }
}

const mapStateToProps = (state) => {
  const selectedChatConversationId = state.getIn(['chats', 'selectedChatConversationId'])
  const isRequest = state.getIn(['chat_conversations', selectedChatConversationId, 'is_approved']) === false

  return {
    selectedChatConversationId,
    isRequest,
    width: state.getIn(['settings', 'window_dimensions', 'width']),
  }
}

const mapDispatchToProps = (dispatch) => ({
  onOpenChatConversationCreateModal() {
    dispatch(openModal(MODAL_CHAT_CONVERSATION_CREATE))
  },
  onOpenSettingsOptionsPopover() {
    dispatch(openPopover(POPOVER_CHAT_SETTINGS))
  },
})

MessagesLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  isSettings: PropTypes.bool,
  showBackBtn: PropTypes.bool,
  source: PropTypes.string,
  onOpenChatConversationCreateModal: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(MessagesLayout)
