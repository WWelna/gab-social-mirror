const NewsIcon = ({
  className = '',
  size = '16px',
  title = 'News',
}) => (
  <svg
    className={className}
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    x='0px'
    y='0px'
    width={size}
    height={size}
    viewBox='0 0 48 48'
    xmlSpace='preserve'
    aria-label={title}
  >
    <g>
      <path d='M 42.73 9.63 C 42.64 9.42 42.51 9.23 42.35 9.07 L 33.78 0.5 C 33.46 0.18 33.02 0 32.57 0 L 6.86 0 C 5.91 0 5.14 0.77 5.14 1.71 L 5.14 46.29 C 5.14 47.23 5.91 48 6.86 48 L 41.14 48 C 42.09 48 42.86 47.23 42.86 46.29 L 42.86 10.29 C 42.86 10.06 42.81 9.84 42.73 9.63 Z M 34.29 39.43 L 13.71 39.43 C 12.77 39.43 12 38.66 12 37.71 C 12 36.77 12.77 36 13.71 36 L 34.29 36 C 35.23 36 36 36.77 36 37.71 C 36 38.66 35.23 39.43 34.29 39.43 Z M 34.29 32.57 L 13.71 32.57 C 12.77 32.57 12 31.8 12 30.86 C 12 29.91 12.77 29.14 13.71 29.14 L 34.29 29.14 C 35.23 29.14 36 29.91 36 30.86 C 36 31.8 35.23 32.57 34.29 32.57 Z M 34.29 25.71 L 13.71 25.71 C 12.77 25.71 12 24.95 12 24 C 12 23.05 12.77 22.29 13.71 22.29 L 34.29 22.29 C 35.23 22.29 36 23.05 36 24 C 36 24.95 35.23 25.71 34.29 25.71 Z M 34.29 18.86 L 13.71 18.86 C 12.77 18.86 12 18.09 12 17.14 C 12 16.2 12.77 15.43 13.71 15.43 L 34.29 15.43 C 35.23 15.43 36 16.2 36 17.14 C 36 18.09 35.23 18.86 34.29 18.86 Z M 34.29 8.57 L 34.29 5.85 L 37 8.57 Z M 34.29 8.57' />
    </g>
  </svg>
)

export default NewsIcon