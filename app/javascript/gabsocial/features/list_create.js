import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  changeListEditorTitle,
  changeListEditorVisibility,
  submitListEditor,
} from '../actions/list_editor'
import { closeModal } from '../actions/modal'
import { MODAL_LIST_CREATE } from '../constants'
import Button from '../components/button'
import Input from '../components/input'
import Form from '../components/form'
import Text from '../components/text'
import Select from '../components/select'

class ListCreate extends React.PureComponent {

  handleOnSubmit = () => {
    this.props.onSubmit(this.props.history)
  }

  render() {
    const {
      value,
      visibility,
      onChange,
      onChangeVisibility,
    } = this.props

    const isDisabled = !value

    return (
      <Form>
        <Input
          title='New feed title'
          placeholder='My new feed...'
          value={value}
          onChange={onChange}
        />

        <div className={[_s.d, _s.my10, _s.py5, _s.ml15].join(' ')}>
          <Text
            htmlFor='list-visibility'
            size='small'
            weight='medium'
            color='secondary'
            tagName='label'
          >
            Visibility
          </Text>
          <Text color='secondary' size='small' className={_s.pt10}>
            By default, feeds are private and only you can see who is on a feed. No one else can view your feeds. No one knows that they are on your feed.
          </Text>
          <Text color='secondary' size='small' className={_s.pt5}>
            If you want your feed to be public, then people will be able to subscribe to your feed, share your feed and see who is on your feed.
          </Text>
        </div>
        <Select
          id='list-visibility'
          value={visibility}
          onChange={onChangeVisibility}
          options={[
            {
              value: 'private',
              title: 'Private'
            },
            {
              value: 'public',
              title: 'Public',
            },
          ]}
        />
        <Button
          isDisabled={isDisabled}
          onClick={this.handleOnSubmit}
          className={_s.mt15}
        >
          <Text color='inherit' align='center'>
            Create feed
          </Text>
        </Button>
      </Form>
    )
  }

}

const mapStateToProps = (state) => ({
  value: state.getIn(['list_editor', 'title']),
  visibility: state.getIn(['list_editor', 'visibility']),
  disabled: state.getIn(['list_editor', 'isSubmitting']),
})

const mapDispatchToProps = (dispatch, { isModal }) => ({
  onChange: (value) => dispatch(changeListEditorTitle(value)),
  onChangeVisibility: (e) => dispatch(changeListEditorVisibility(e.target.value)),
  onSubmit: (routerHistory) => {
    if (isModal) dispatch(closeModal(MODAL_LIST_CREATE))
    dispatch(submitListEditor(true, routerHistory))
  },
})

ListCreate.propTypes = {
  value: PropTypes.string,
  visibility: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onChangeVisibility: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isModal: PropTypes.bool,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ListCreate))