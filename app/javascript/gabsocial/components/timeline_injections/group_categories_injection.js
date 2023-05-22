import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import slugify from '../../utils/slugify'
import Button from '../button'
import Text from '../text'
import TimelineInjectionLayout from './timeline_injection_layout'

class GroupCategoriesInjection extends React.PureComponent {
  render() {
    const { categories, isXS, injectionId } = this.props

    const categoriesOptions = []
    if (categories) {
      for (let i = 0; i < categories.count(); i++) {
        const c = categories.get(i)
        const title = c.get('text')
        categoriesOptions.push({
          title,
          to: `/groups/browse/categories/${slugify(title)}`
        })
      }
    }

    const split1Arr = categoriesOptions.splice(
      0,
      Math.ceil(categoriesOptions.length / 2)
    )

    return (
      <TimelineInjectionLayout
        id={injectionId}
        title="Popular group categories"
        subtitle="Find a group by browsing top categories."
        buttonLink="/groups/browse/categories"
        buttonTitle="Browse all categories"
        isXS={isXS}
      >
        <div className={[_s.d, _s.pb10].join(' ')}>
          <div className={[_s.d, _s.flexRow, _s.mb5].join(' ')}>
            {split1Arr.map((block, i) => (
              <Button
                isNarrow
                to={block.to}
                color="primary"
                backgroundColor="tertiary"
                className={[_s.mr10].join(' ')}
                key={`group-category-injections-1-${i}`}
              >
                <Text color="inherit">{block.title}</Text>
              </Button>
            ))}
          </div>

          <div className={[_s.d, _s.flexRow].join(' ')}>
            {categoriesOptions.map((block, i) => (
              <Button
                isNarrow
                to={block.to}
                color="primary"
                backgroundColor="tertiary"
                className={[_s.mr10].join(' ')}
                key={`group-category-injections-2-${i}`}
              >
                <Text color="inherit">{block.title}</Text>
              </Button>
            ))}
          </div>
        </div>
      </TimelineInjectionLayout>
    )
  }
}

const mapStateToProps = state => ({
  categories: state.getIn(['group_categories', 'items'])
})

GroupCategoriesInjection.propTypes = {
  categories: ImmutablePropTypes.list,
  injectionId: PropTypes.string,
  isXS: PropTypes.bool
}

export default connect(mapStateToProps)(GroupCategoriesInjection)
