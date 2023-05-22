import React from 'react'
import PropTypes from 'prop-types'
import Icon from './icon'
import ZoomableImage from './zoomable_image'

class ImageLoader extends React.PureComponent {

  state = {
    loading: true,
    error: false,
    width: null,
  }

  removers = [];

  componentDidMount () {
    this.loadImage(this.props);
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (this.props.src !== nextProps.src) {
      this.loadImage(nextProps);
    }
  }

  componentWillUnmount () {
    this.removeEventListeners();
  }

  loadImage (props) {
    this.removeEventListeners();
    this.setState({ loading: true, error: false });
    Promise.all([this.loadOriginalImage(props)].filter(Boolean))
      .then(() => {
        this.setState({ loading: false, error: false });
      })
      .catch(() => this.setState({ loading: false, error: true }));
  }

  loadOriginalImage = ({ src }) => new Promise((resolve, reject) => {
    const image = new Image();
    const removeEventListeners = () => {
      image.removeEventListener('error', handleError);
      image.removeEventListener('load', handleLoad);
    };
    const handleError = () => {
      removeEventListeners();
      reject();
    };
    const handleLoad = () => {
      removeEventListeners();
      resolve();
    };
    image.addEventListener('error', handleError);
    image.addEventListener('load', handleLoad);
    image.src = src;
    this.removers.push(removeEventListeners);
  });

  removeEventListeners () {
    this.removers.forEach(listeners => listeners());
    this.removers = [];
  }

  render () {
    const { alt, src, previewSrc, onClick } = this.props
    const { loading } = this.state

    return (
      <div className={[_s.d, _s.w100PC, _s.h100PC].join(' ')}>
        <ZoomableImage
          alt={alt}
          src={loading ? previewSrc : src}
          onClick={onClick}
        />
        {
          loading &&
          <div className={[_s.d, _s.posAbs, _s.top0, _s.left0, _s.bottom0, _s.right0, _s.aiCenter, _s.jcCenter].join(' ')}>
            <Icon id='loading' />
         </div>
        }
      </div>
    );
  }

}

ImageLoader.propTypes = {
  alt: PropTypes.string,
  src: PropTypes.string.isRequired,
  previewSrc: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  onClick: PropTypes.func,
}

ImageLoader.defaultProps = {
  alt: '',
  width: null,
  height: null,
}

export default ImageLoader
