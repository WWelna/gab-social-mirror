import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  updateBookmarkCollection,
  removeBookmarkCollection,
} from '../actions/bookmarks'
import { MODAL_CONFIRM } from '../constants'
import { meUsername } from '../initial_state'
import {
  openModal,
  closeModal,
} from '../actions/modal'
import Button from '../components/button'
import Input from '../components/input'
import Form from '../components/form'
import Divider from '../components/divider'
import Text from '../components/text'

class BookmarkCollectionEdit extends React.PureComponent {

  state = {
    value: this.props.bookmarkCollectionTitle,
  }

  onChange = (value) => {
    this.setState({ value })
  }

  handleOnSubmit = () => {
    const { onSubmit, bookmarkCollectionId } = this.props
    const { value } = this.state
    onSubmit(bookmarkCollectionId, value)
  }

  handleOnDelete = () => {
    this.props.onDelete(this.props.bookmarkCollectionId, this.props.history)
    
  }

  render() {
    const { bookmarkCollectionId } = this.props
    const { value } = this.state

    const isDisabled = !value || !bookmarkCollectionId

    return (
      <Form>
        <Input
          title='Title'
          placeholder='Bookmark collection title'
          value={value}
          onChange={this.onChange}
        />

        <Button
          isDisabled={isDisabled}
          onClick={this.handleOnSubmit}
          className={[_s.mt10, _s.mb15].join(' ')}
        >
          <Text color='inherit' align='center'>
            Update
          </Text>
        </Button>

        <Divider />

        <div className={_s.mb10}>
          <Button
            onClick={this.handleOnDelete}
            backgroundColor='danger'
          >
            Delete Bookmark Collection
          </Button>
        </div>
        <Text size='extraSmall' color='secondary'>
          Once you delete a bookmark collection you cannot retrieve it.
        </Text>
        
      </Form>
    )
  }

}

const mapStateToProps = (state, { bookmarkCollectionId }) => {
  const bookmarkCollection = state.getIn(['bookmark_collections', 'items', `${bookmarkCollectionId}`])
  const bookmarkCollectionTitle = bookmarkCollectionId === 'saved' ? 'Saved' : !!bookmarkCollection ? bookmarkCollection.get('title') : null
  return {
    bookmarkCollectionId,
    bookmarkCollectionTitle,
  }
}


const mapDispatchToProps = (dispatch, { isModal }) => ({
  onSubmit(id, title) {
    if (isModal) dispatch(closeModal())
    dispatch(updateBookmarkCollection(id, title))
  },
  onDelete(bookmarkCollectionId, routerHistory) {
    dispatch(openModal(MODAL_CONFIRM, {
      title: 'Delete bookmark collection',
      message: 'Are you sure you want to delete this bookmark collection?',
      confirm: 'Delete',
      onConfirm: () => dispatch(removeBookmarkCollection(bookmarkCollectionId, routerHistory)),
    }))
  }
})

BookmarkCollectionEdit.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isModal: PropTypes.bool,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BookmarkCollectionEdit))