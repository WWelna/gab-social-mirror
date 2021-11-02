import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { shortNumberFormat } from '../../utils/numbers'
import { fetchTrendingHashtags } from '../../actions/trending_hashtags'
import List from '../list'
import PanelLayout from './panel_layout'
import Text from '../text'

class TrendingHashtagsPanel extends React.PureComponent {

  state = {
    fetched: !this.props.isLazy,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.shouldLoad && !prevState.fetched) {
      return { fetched: true }
    }

    return null
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.fetched && this.state.fetched) {
      this.props.onFetchTrendingHashtags()
    }
  }

  componentDidMount() {
    if (!this.props.isLazy) {
      this.props.onFetchTrendingHashtags()
      return
    }
  }

  render() {
    const { trendingHashtags } = this.props

    if (!trendingHashtags || !Array.isArray(trendingHashtags)) return <div />
    if (trendingHashtags.length <= 0) return <div />

    const items = trendingHashtags.map((block) => {
      return {
        title: (
          <Text color='primary' weight='bold' size='medium'>{`#${block.tag}`}</Text>
        ),
        to: `/tags/${block.tag}`,
        size: 'large',
      }
    })


    return (
      <PanelLayout
        noPadding
        title='Trending Hashtags'
      >
        <List items={items} />
      </PanelLayout>
    )
  }
}

const mapStateToProps = (state) => ({
  trendingHashtags: state.getIn(['trending_hashtags', 'items']),
})

const mapDispatchToProps = (dispatch) => ({
  onFetchTrendingHashtags() {
    dispatch(fetchTrendingHashtags())
  },
})

TrendingHashtagsPanel.propTypes = {
  isLazy: PropTypes.bool,
  isLoading: PropTypes.bool,
  isFetched: PropTypes.bool,
  trendingHashtags: PropTypes.array,
}

export default connect(mapStateToProps, mapDispatchToProps)(TrendingHashtagsPanel)