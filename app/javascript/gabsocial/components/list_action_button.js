import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ImmutablePureComponent from 'react-immutable-pure-component'
import {
  subscribeToList,
  unsubscribeFromList,
  fetchListRelationships,
} from '../actions/lists'
import { me } from '../initial_state'
import Button from './button'
import Text from './text'

class ListActionButton extends ImmutablePureComponent {

  componentDidMount() {
    const { list, relationships } = this.props
    if (!relationships && !!list) {
      this.props.onFetchListRelationships(list.get('id'))
    }
  }

  handleToggleSubscription = () => {
    const { list, relationships } = this.props
    
    if (!list || !relationships) return false

    const listId = list.get('id')
    const isSubbed = relationships.get('subscriber')
 
    if (isSubbed) {
      this.props.onUnsubscribeToList(listId)
    } else {
      this.props.onSubscribeToList(listId)
    } 
  }

  render() {
    const {
      list,
      relationships,
    } = this.props

    if (!list || !relationships || !me) return null

    const isSubbed = relationships.get('subscriber')
    const buttonText = isSubbed ? 'Subscribed' : 'Subscribe'

    return (
      <Button
        color={isSubbed ? 'white' : 'brand'}
        backgroundColor={isSubbed ? 'brand' : 'none'}
        isOutline={!isSubbed}
        onClick={this.handleToggleSubscription}
        className={[_s.jcCenter, _s.aiCenter].join(' ')}
      >
        <Text
          color='inherit'
          align='center'
          weight='bold'
          size='medium'
          className={_s.px10}
        >
          {buttonText}
        </Text>
      </Button>
    )
  }

}

const mapStateToProps = (state, { list }) => {
  const listId = !!list ? list.get('id') : null
  if (!listId) return {}
  
  return {
    relationships: state.getIn(['list_relationships', listId])
  }
}

const mapDispatchToProps = (dispatch) => ({
  onSubscribeToList(listId) {
    dispatch(subscribeToList(listId))
  },
  onUnsubscribeToList(listId) {
    dispatch(unsubscribeFromList(listId))
  },
  onFetchListRelationships(listId) {
    dispatch(fetchListRelationships([listId]))
  },
})

ListActionButton.propTypes = {
  list: ImmutablePropTypes.map,
  relationships: ImmutablePropTypes.map,
  onSubscribeToList: PropTypes.func.isRequired,
  onUnsubscribeToList: PropTypes.func.isRequired,
  onFetchListRelationships: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ListActionButton)
