import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'
import {
  MARKETPLACE_LISTING_SORY_BY,
  MARKETPLACE_LISTING_CONDITIONS,
} from '../../constants'
import {
  fetchMarketplaceListingsBySearch
} from '../../actions/marketplace_listing_search'
import {
  fetchMarketplaceListingCategories
} from '../../actions/marketplace_listing_categories'
import { isStaff } from '../../initial_state'
import { isTouch } from '../../utils/is_mobile'
import {
  setParamsForMarketplaceListingSearch
} from '../../actions/marketplace_listing_search'
import ResponsiveClassesComponent from '../../features/ui/util/responsive_classes_component'
import PanelLayout from './panel_layout'
import Select from '../select'
import Text from '../text'
import Button from '../button'
import Input from '../input'
import Divider from '../divider'

const marketplaceListingSortBySelectOptions = Object.keys(MARKETPLACE_LISTING_SORY_BY).map((option) => ({
  value: option,
  title: MARKETPLACE_LISTING_SORY_BY[option],
}))

const filterNonNull = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([k, v]) => v));
}

class MarketplaceListingFilterPanel extends React.PureComponent {

  state = {
    isAdvancedOpen: isTouch(),
    isChanged: false,
    tags: this.props.filters.get('tags'),
    query: this.props.filters.get('query'),
    location: this.props.filters.get('location'),
    priceMin: this.props.filters.get('price_min'),
    priceMax: this.props.filters.get('price_max'),
    sortBy: this.props.filters.get('sort_by'),
    condition: this.props.filters.get('condition'),
    categoryId: this.props.filters.get('category_id'),
    shippingValue: this.props.filters.get('shipping_required'),
    hasImagesValue: this.props.filters.get('has_images'),
  }

  componentDidMount() {
    this._checkIfHasCategories()
  }

  componentDidUpdate(prevProps) {
    this._checkIfHasCategories()
  }

  _checkIfHasCategories = () => {
    if (!this.props.categoriesIsFetched) {
      this.props.dispatch(fetchMarketplaceListingCategories())
    }
  }

  handleOnSubmit = (e) => {
    e.preventDefault()

    const {
      query,
      tags,
      location,
      categoryId,
      priceMin,
      priceMax,
      sortBy,
      condition,
      shippingValue,
      hasImagesValue,
    } = this.state

    try {
      const qs = queryString.stringify(filterNonNull({
        query,
        tags,
        location,
        condition,
        price_min: priceMin,
        price_max: priceMax,
        sort_by: sortBy,
        category_id: categoryId,
        shipping_required: shippingValue,
        has_images: hasImagesValue,
      }))
      const qp = queryString.parse(qs) 
      this.props.history.replace({
        pathname: '/marketplace/listings',
        search: `?${qs}`,
        isActive: true,
      })
      this.props.dispatch(setParamsForMarketplaceListingSearch(qp))
      this.props.dispatch(fetchMarketplaceListingsBySearch())
    } catch (error) {
      // 
      console.log("Error with submitting Gab Marketplace listing search: ", error)
    }
  }

  handleClearQuery = () => {
    this.setState({ query: '', isChanged: true })
  }

  handleChangeQuery = (value) => {
    this.setState({ query: value, isChanged: true })
  }

  handleChangeSortBy = (e) => {
    this.setState({ sortBy: e.target.value, isChanged: true })
  }

  handleChangeCondition = (e) => {
    this.setState({ condition: e.target.value, isChanged: true })
  }

  handleChangeCategory = (e) => {
    this.setState({ categoryId: e.target.value, isChanged: true })
  }

  handleChangeLocation = (value) => {
    this.setState({ location: value, isChanged: true })
  }

  handleChangeTags = (value) => {
    this.setState({ tags: value, isChanged: true })
  }

  handleChangePriceMin = (value) => {
    this.setState({ priceMin: value, isChanged: true })
  }

  handleChangePriceMax = (value) => {
    this.setState({ priceMax: value, isChanged: true })
  }

  handleChangeShippingRequired = (e) => {
    this.setState({ shippingValue: e.target.value, isChanged: true })
  }

  handleChangeHasImages = (e) => {
    this.setState({ hasImagesValue: e.target.value, isChanged: true })
  }

  toggleIsAdvancedOpen = () => {
    const { isAdvancedOpen } = this.state
    this.setState({ isAdvancedOpen: !isAdvancedOpen })
  }
  
  keypress = evt => {
    if (evt.charCode === 13 || evt.which === 13) {
      // enter key
      this.handleOnSubmit(evt)
    }
  }

  render() {
    const {
      isAdvancedOpen,
      isChanged,
      tags,
      query,
      location,
      priceMin,
      priceMax,
      sortBy,
      condition,
      categoryId,
      shippingValue,
      hasImagesValue,
    } = this.state
    const { categories } = this.props

    const categoryOptions = !!categories ? categories.map((category) => ({
      value: category.get('id'),
      title: category.get('name'),
    })).unshift({ value: null, title: 'All' }) : [{ value: null, title: 'All' }]

    return (
      <PanelLayout
        title='Search'
        headerButtonAction={this.handleOnSubmit}
        headerButtonTitle={isChanged ? 'Submit' : null}
        noPadding
      >
        <div className={[_s.d, _s.px15, _s.py10].join(' ')}>
          <Input
            placeholder='Search Marketplace'
            prependIcon='search'
            value={query}
            // hasClear
            onChange={this.handleChangeQuery}
            onKeyPress={this.keypress}
            id='mpl-search'
            hideLabel
            maxLength={120}
          />
        </div>
        
        <Divider isSmall />

        <div className={[_s.d, _s.px15, _s.py10].join(' ')}>
          <Text size='large' weight='bold' className={_s.mb10}>Filters</Text>
          
          <div className={[_s.d, _s.flexRow, _s.flexWrap, _s.mt10, _s.mb10, _s.aiCenter].join(' ')}>
            <Text htmlFor='mpl-sort-by' tagName='label' weight='medium' className={[_s.minW84PX, _s.pr10].join(' ')}>Sort by</Text>
            <div className={[_s.d, _s.flexGrow1].join(' ')}>
              <Select
                isSmall
                id='mpl-sort-by'
                value={sortBy}
                onChange={this.handleChangeSortBy}
                options={marketplaceListingSortBySelectOptions}
              />
            </div>
          </div>

          <div className={[_s.d, _s.flexRow, _s.flexWrap, _s.mt5, _s.mb10, _s.aiCenter].join(' ')}>
            <Text htmlFor='mpl-category' tagName='label' weight='medium' className={[_s.minW84PX, _s.pr10].join(' ')}>Category</Text>
            <div className={[_s.d, _s.flexGrow1].join(' ')}>
              <Select
                isSmall
                id='mpl-category'
                value={categoryId}
                onChange={this.handleChangeCategory}
                options={categoryOptions}
              />
            </div>
          </div>
   
          <div className={[_s.d, _s.flexRow, _s.flexWrap, _s.mt5, _s.mb10, _s.aiCenter].join(' ')}>
            <Text htmlFor='mpl-price-min' tagName='label' tagName='label'weight='medium' className={[_s.minW84PX, _s.pr10].join(' ')}>Price</Text>
            <div className={[_s.d, _s.flexGrow1].join(' ')}>
              <div className={[_s.d, _s.flexRow].join(' ')}>
                <div className={[_s.d, _s.w72PX].join(' ')}>
                  <Input
                    small
                    id='mpl-price-min'
                    placeholder='Min'
                    type='number'
                    value={priceMin}
                    maxLength={8}
                    onChange={this.handleChangePriceMin}
                  />
                </div>
                <Text className={[_s.d, _s.px10, _s.py10].join(' ')}>
                  to
                </Text>
                <div className={[_s.d, _s.w72PX].join(' ')}>
                  <Input
                    small
                    id='mpl-price-max'
                    placeholder='Max'
                    type='number'
                    value={priceMax}
                    maxLength={8}
                    onChange={this.handleChangePriceMax}
                  />
                </div>
              </div>
            </div>
          </div>

          {
            !isAdvancedOpen &&
            <div className={[_s.d, _s.flexRow, _s.aiCenter, _s.py5].join(' ')}>
              <div className={[_s.d, _s.flexGrow1].join(' ')}>
                <Divider isSmall />
              </div>
              <Button
                noClasses
                onClick={this.toggleIsAdvancedOpen}
                className={[_s.d, _s.py5, _s.px15, _s.circle, _s.borderColorSecondary, _s.border1PX, _s.cursorPointer, _s.outlineNone, _s.noUnderline, _s.bgTransparent].join(' ')}
              >
                <Text color='secondary' size='small'>
                  More Filters
                </Text>
              </Button>
              <div className={[_s.d, _s.flexGrow1].join(' ')}>
                <Divider isSmall />
              </div>
            </div>
          }

          {
            isAdvancedOpen &&
            <div>
              <div className={[_s.d, _s.flexRow, _s.flexWrap, _s.mt5, _s.mb10, _s.aiCenter].join(' ')}>
                <Text htmlFor='mpl-condition' tagName='label' weight='medium' className={[_s.minW84PX, _s.pr10].join(' ')}>Condition</Text>
                <div className={[_s.d, _s.flexGrow1].join(' ')}>
                  <Select
                    isSmall
                    id='mpl-condition'
                    value={condition}
                    onChange={this.handleChangeCondition}
                    options={MARKETPLACE_LISTING_CONDITIONS}
                  />
                </div>
              </div>

              <div className={[_s.d, _s.flexRow, _s.flexWrap, _s.mt5, _s.aiCenter].join(' ')}>
                <Text htmlFor='mpl-shipping' tagName='label' weight='medium' className={[_s.minW84PX, _s.pr10].join(' ')}>Shippable?</Text>
                <div className={[_s.d, _s.flexGrow1].join(' ')}>
                  <Select
                    isSmall
                    id='mpl-shipping'
                    value={shippingValue}
                    onChange={this.handleChangeShippingRequired}
                    options={[
                      {
                        title: 'All',
                        value: null,
                      },
                      {
                        title: 'Yes',
                        value: 1,
                      },
                      {
                        title: 'No',
                        value: 0,
                      }
                    ]}
                  />
                </div>
              </div>
                
            
              <div className={[_s.d, _s.mt10, _s.mb10].join(' ')}>
                <Text htmlFor='mpl-location' tagName='label' weight='medium' className={[_s.mb5].join(' ')}>Location</Text>
                <Text color='secondary' size='extraSmall' className={[_s.mb15].join(' ')}>
                  * May not always be accurate
                </Text>
                <div className={[_s.d, _s.flexGrow1].join(' ')}>
                  <Input
                    id='mpl-location'
                    placeholder='City/State/Town'
                    value={location}
                    maxLength={120}
                    onChange={this.handleChangeLocation}
                  />
                </div>
              </div>

              <div className={[_s.d, _s.mt5, _s.mb10].join(' ')}>
                <Text htmlFor='mpl-tags' tagName='label' weight='medium' className={[_s.mb15].join(' ')}>Tags</Text>
                <div className={[_s.d, _s.flexGrow1].join(' ')}>
                  <Input
                    id='mpl-tags'
                    placeholder='restored, leather, etc.'
                    value={tags}
                    maxLength={120}
                    onChange={this.handleChangeTags}
                  />
                </div>
              </div>
            </div>
          }

          {/* if staff allow account search here */}

          <Button
            isDisabled={!isChanged}
            onClick={this.handleOnSubmit}
            className={[_s.mt10, _s.aiCenter].join(' ')}
          >
            <Text color='inherit' size='medium' weight='medium' align='center'>
              Submit
            </Text>
          </Button>
        </div>
      </PanelLayout>
    )
  }
}

const mapStateToProps = (state) => ({
  filters: state.getIn(['marketplace_listing_search', 'filters']),
  categories: state.getIn(['marketplace_listing_categories', 'items']),
  categoriesIsFetched: state.getIn(['marketplace_listing_categories', 'isFetched']),
})

MarketplaceListingFilterPanel.propTypes = {
  isModal: PropTypes.bool,
  isXS: PropTypes.bool,
}

export default withRouter(connect(mapStateToProps)(MarketplaceListingFilterPanel))
