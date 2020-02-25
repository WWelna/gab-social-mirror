import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import Masonry from 'react-masonry-infinite';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import { debounce } from 'lodash';
import { expandPublicTimeline, expandCommunityTimeline } from '../../../actions/timelines';
import DetailedStatusContainer from '../../../features/status/containers/detailed_status_container';
import ColumnIndicator from '../../../components/column_indicator';

const mapStateToProps = (state, { local }) => {
  const timeline = state.getIn(['timelines', local ? 'community' : 'public'], ImmutableMap());

  return {
    statusIds: timeline.get('items', ImmutableList()),
    isLoading: timeline.get('isLoading', false),
    hasMore: timeline.get('hasMore', false),
  };
};

export default
@connect(mapStateToProps)
class PublicTimeline extends ImmutablePureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    statusIds: ImmutablePropTypes.list.isRequired,
    isLoading: PropTypes.bool.isRequired,
    hasMore: PropTypes.bool.isRequired,
    local: PropTypes.bool,
  };

  componentDidMount () {
    this._connect();
  }

  componentDidUpdate (prevProps) {
    if (prevProps.local !== this.props.local) {
      this._connect();
    }
  }

  _connect () {
    const { dispatch, local } = this.props;

    dispatch(local ? expandCommunityTimeline() : expandPublicTimeline());
  }

  handleLoadMore = () => {
    const { dispatch, statusIds, local } = this.props;
    const maxId = statusIds.last();

    if (maxId) {
      dispatch(local ? expandCommunityTimeline({ maxId }) : expandPublicTimeline({ maxId }));
    }
  }

  setRef = c => {
    this.masonry = c;
  }

  handleHeightChange = debounce(() => {
    if (!this.masonry) {
      return;
    }

    this.masonry.forcePack();
  }, 50)

  render () {
    const { statusIds, hasMore, isLoading } = this.props;

    const sizes = [
      { columns: 1, gutter: 0 },
      { mq: '415px', columns: 1, gutter: 10 },
      { mq: '640px', columns: 2, gutter: 10 },
      { mq: '960px', columns: 3, gutter: 10 },
      { mq: '1255px', columns: 3, gutter: 10 },
    ];

    const loader = (isLoading && statusIds.isEmpty()) ? <ColumnIndicator type='loading' key={0} /> : undefined;

    return (
      <Masonry ref={this.setRef} className='statuses-grid' hasMore={hasMore} loadMore={this.handleLoadMore} sizes={sizes} loader={loader}>
        {statusIds.map(statusId => (
          <div className='statuses-grid__item' key={statusId}>
            <DetailedStatusContainer
              id={statusId}
              compact
              measureHeight
              onHeightChange={this.handleHeightChange}
            />
          </div>
        )).toArray()}
      </Masonry>
    );
  }

}
