import {
  GAB_TRENDS_FETCH_REQUEST,
  GAB_TRENDS_FETCH_SUCCESS,
  GAB_TRENDS_FETCH_FAIL,
  GAB_TREND_FEED_EXPAND_REQUEST,
  GAB_TREND_FEED_EXPAND_SUCCESS,
  GAB_TREND_FEED_EXPAND_FAIL,
  GAB_NEWS_FETCH_REQUEST,
  GAB_NEWS_FETCH_SUCCESS,
  GAB_NEWS_FETCH_FAIL,
  LATEST_GAB_STATUSES_FETCH_REQUEST,
  LATEST_GAB_STATUSES_FETCH_SUCCESS,
  LATEST_GAB_STATUSES_FETCH_FAIL,
  GAB_TV_EXPLORE_FETCH_REQUEST,
  GAB_TV_EXPLORE_FETCH_SUCCESS,
  GAB_TV_EXPLORE_FETCH_FAIL,
} from '../actions/news'
import {
  Map as ImmutableMap,
  List as ImmutableList,
  fromJS,
} from 'immutable'
import { toHHMMSS } from '../utils/time'
import { shortNumberFormat } from '../utils/numbers'

const defaultMap = ImmutableMap({
  isLoading: false,
  isFetched: false,
  items: ImmutableList(),
})

const initialState = ImmutableMap({
  trends_leadline: ImmutableMap(),
  trends_headlines: defaultMap,
  trends_breaking: defaultMap,
  gab_news: defaultMap,
  latest_from_gab: defaultMap,
  trends_feeds: ImmutableMap(), // ex: { 'feed_id_1': defaultMap, 'feed_id_2': defaultMap, ... }
})

const normalizeHeadlineItem = (item) => {
  return ImmutableMap({
    trend_id: item._id,
    title: item.title,
    trends_url: `https://trends.gab.com/trend?url=${item.href}`,
  })
}

const normalizeTrendsItem = (item) => {
  return ImmutableMap({
    title: `${item.pagePreview.title}`.trim(),
    description: `${item.pagePreview.description}`.trim(),
    publish_date: item.pubDate,
    image: Array.isArray(item.pagePreview.images) ? null : null, // : todo :
    feed_title: item.feed.title,
    feed_slug: item.feed.slug,
    feed_base_url: `${item.feed.url}`.replace('www.', '').replace('https://', '').replace('http://', '').replace('/', ''),
    trend_feed_id: item.feed._id,
    trend_id: item._id,
    trends_url: `https://trends.gab.com/trend?url=${item.link}`,
  })
}

const normalizeNewsItem = (item) => {
  return ImmutableMap({
    id: item.id,
    url: item.url,
    title: item.title,
    image: item.image,
    publish_date: item.date_published,
  })
}

const normalizeGabTVEpisode = (item) => {
  return ImmutableMap({
    id: item._id,
    videoUrl: `https://tv.gab.com/channel/${item.channel.slug}/view/${item.slug}`,
    title: item.title,
    views: shortNumberFormat(item.stats.playCount),
    thumbnail: `${item.image}`,
    created: item.created,
    channelName: item.channel.name,
    channelAvatar: item.publisher.picture_url,
    duration: toHHMMSS(item.content.metadata.duration),
  })
}

const setStateKeysOnRequest = (state, keys) => {
  return state.withMutations((map) => {
    keys.map((key) => {
      map.setIn([key, 'isLoading'], true)
    })
  })
}

const setStateKeysOnFail = (state, keys) => {
  return state.withMutations((map) => {
    keys.map((key) => {
      map.setIn([key, 'isLoading'], false)
      map.setIn([key, 'isFetched'], true)
      map.setIn([key, 'items'], ImmutableList())
    })
  })
}

const setStateKeysOnSuccess = (state, keysAndData) => {
  return state.withMutations((map) => {
    Object.keys(keysAndData).map((key) => {
      map.setIn([key, 'isLoading'], false)
      map.setIn([key, 'isFetched'], true)
      map.setIn([key, 'items'], keysAndData[key])
    })
  })
}

export default function (state = initialState, action) {
  switch (action.type) {
    case GAB_TV_EXPLORE_FETCH_REQUEST:
      return setStateKeysOnRequest(state, ['gab_tv_explore'])
    case GAB_TV_EXPLORE_FETCH_FAIL:
      return setStateKeysOnFail(state, ['gab_tv_explore'])
    case GAB_TV_EXPLORE_FETCH_SUCCESS:
      let data = {}
      try {
        data.gab_tv_explore = ImmutableList(action.data.episodes.map((item) => normalizeGabTVEpisode(item)))
      } catch (error) {
        data = { gab_tv_explore: ImmutableList() }
      }
      return setStateKeysOnSuccess(state, data)

    case GAB_TRENDS_FETCH_REQUEST:
      return setStateKeysOnRequest(state, ['trends_headlines', 'trends_breaking'])
    case GAB_TRENDS_FETCH_FAIL:
      return setStateKeysOnFail(state, ['trends_headlines', 'trends_breaking'])
    case GAB_TRENDS_FETCH_SUCCESS:
      let trendsFetchData = {}
      try {
        trendsFetchData.trends_headlines = ImmutableList(action.items.trends.leadHeadlines.map((item) => normalizeHeadlineItem(item)))
        trendsFetchData.trends_breaking = ImmutableList(action.items.trends.rssFeedItems.map((item) => normalizeTrendsItem(item)))
        trendsFetchData.trends_leadline = ImmutableMap({
          title: action.items.trends.headline.title,
          image: `https://trends.gab.com/image/${action.items.trends.headline.image._id}`,
          trends_url: `https://trends.gab.com/trend?url=${action.items.trends.headline.href}`,
        })
      } catch (error) {
        trendsFetchData = {
          breakingItems: ImmutableList(),
          headlineItems: ImmutableList(),
          trends_leadline: ImmutableMap(),
        }
      }
      return setStateKeysOnSuccess(state, trendsFetchData)

    // 
    case LATEST_GAB_STATUSES_FETCH_REQUEST:
      return setStateKeysOnRequest(state, ['latest_from_gab'])
    case LATEST_GAB_STATUSES_FETCH_FAIL:
      return setStateKeysOnFail(state, ['latest_from_gab'])
    case LATEST_GAB_STATUSES_FETCH_SUCCESS:
      let latestGabStatusData = {}
      try {
        latestGabStatusData.latest_from_gab = ImmutableList(action.statuses.map((status) => status.id))
      } catch (error) {
        latestGabStatusData = {
          latest_from_gab: ImmutableList(),
        }
      }
      return setStateKeysOnSuccess(state, latestGabStatusData)

    // 
    case GAB_NEWS_FETCH_REQUEST:
      return setStateKeysOnRequest(state, ['gab_news'])
    case GAB_NEWS_FETCH_FAIL:
      return setStateKeysOnFail(state, ['gab_news'])
    case GAB_NEWS_FETCH_SUCCESS:
      let latestGabNewsData = {}
      try {
        latestGabNewsData.gab_news = ImmutableList(action.items.map((item) => normalizeNewsItem(item)))
      } catch (error) {
        latestGabNewsData = {
          gab_news: ImmutableList(),
        }
      }
      return setStateKeysOnSuccess(state, latestGabNewsData)
      
    //
    case GAB_TREND_FEED_EXPAND_REQUEST:
      return state.withMutations((map) => {
        const exists = !!map.getIn(['trends_feeds', `${action.feedId}`], null)
        if (!exists) {
          map.setIn(['trends_feeds', `${action.feedId}`], ImmutableMap({
            isLoading: false,
            isFetched: false,
            items: ImmutableList(),
          }))
        } else {
          map.setIn(['trends_feeds', `${action.feedId}`, 'isLoading'], true)
        }
      })
    case GAB_TREND_FEED_EXPAND_FAIL:
      return state.withMutations((map) => {
        map.setIn(['trends_feeds', `${action.feedId}`], ImmutableMap({
          isLoading: false,
          isFetched: true,
          items: ImmutableList(),
        }))
      })
    case GAB_TREND_FEED_EXPAND_SUCCESS:
      let latestGabTrendFeedData = []
      try {
        latestGabTrendFeedData = state.getIn(['trends_feeds', `${action.feedId}`, 'items']).concat(action.items.map((item) => normalizeTrendsItem(item)))
      } catch (error) {
        latestGabTrendFeedData = ImmutableList()
      }
      
      return state.withMutations((map) => {
        map.setIn(['trends_feeds', `${action.feedId}`, 'isLoading'], false)
        map.setIn(['trends_feeds', `${action.feedId}`, 'isFetched'], true)
        map.setIn(['trends_feeds', `${action.feedId}`, 'curPage'], action.curPage)
        map.setIn(['trends_feeds', `${action.feedId}`, 'items'], latestGabTrendFeedData)
      })
    default:
      return state
  }
}
