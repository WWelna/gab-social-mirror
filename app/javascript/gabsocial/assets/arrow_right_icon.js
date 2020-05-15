const ArrowRightIcon = ({
  className = '',
  size = '16px',
  title = '',
}) => (
  <svg
    className={className}
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    x='0px'
    y='0px'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    xmlSpace='preserve'
    aria-label={title}
  >
    <g>
      <path d='M19.707 11.293l-6-6c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L16.586 11H4c-.553 0-1 .447-1 1s.447 1 1 1h12.586l-4.293 4.293c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293l6-6c.39-.39.39-1.023 0-1.414z' />
    </g>
  </svg>
)

export default ArrowRightIcon