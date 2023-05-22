import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePureComponent from 'react-immutable-pure-component'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Block from './block'
import ScrollableList from './scrollable_list'
import ListItem from './list_item'
import Dummy from './dummy'
import ListItemPlaceholder from './placeholder/list_item_placeholder'

class List extends ImmutablePureComponent {

  render() {
    const {
      items,
      scrollKey,
      emptyMessage,
      hasMore,
      size,
      onLoadMore,
      isLoading,
      showLoading,
    } = this.props

    const Wrapper = !!scrollKey ? ScrollableList : Dummy
    const itemsSize = !!items ? Array.isArray(items) ? items.length : items.size : 0

    const inner = !!items && itemsSize > 0 ?
      items.map((item, i) => (
        <ListItem
          size={size}
          key={`list-item-${i}`}
          isLast={itemsSize - 1 === i}
          {...item}
        />
      )) : null;

    return (
      <Block>
        <Wrapper
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          scrollKey={scrollKey}
          emptyMessage={emptyMessage}
          isLoading={isLoading}
          showLoading={showLoading}
          placeholderComponent={ListItemPlaceholder}
          placeholderCount={5}
        >
          {inner}
        </Wrapper>
      </Block>
    )
  }

}

List.propTypes = {
  items: PropTypes.oneOfType([
    PropTypes.array,
    ImmutablePropTypes.map,
    ImmutablePropTypes.list,
  ]),
  scrollKey: PropTypes.string,
  emptyMessage: PropTypes.any,
  size: PropTypes.oneOf([
    'small',
    'normal',
    'large'
  ]),
  onLoadMore: PropTypes.func,
  hasMore: PropTypes.bool,
  isLoading: PropTypes.bool,
  showLoading: PropTypes.bool,
}

export default List
