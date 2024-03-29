import React from 'react'

const VerifiedIcon = ({
  className = '',
  size = '24px',
}) => (
  <svg
    className={className}
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    x='0px'
    y='0px'
    width={size}
    height={size}
    viewBox='0 0 32 32'
    xmlSpace='preserve'
    role='img'
  >
    <title>Verified Account</title>
    <g>
      <path fill='#3E99ED' d='M 27.31 4.69 C 24.29 1.66 20.27 0 16 0 C 11.73 0 7.71 1.66 4.69 4.69 C 1.66 7.71 0 11.73 0 16 C 0 20.27 1.66 24.29 4.69 27.31 C 7.71 30.34 11.73 32 16 32 C 20.27 32 24.29 30.34 27.31 27.31 C 30.34 24.29 32 20.27 32 16 C 32 11.73 30.34 7.71 27.31 4.69 Z M 23.64 12.19 L 14.7 21.13 C 14.52 21.32 14.28 21.41 14.04 21.41 C 13.8 21.41 13.56 21.32 13.38 21.13 L 8.36 16.11 C 7.99 15.75 7.99 15.15 8.36 14.79 C 8.72 14.42 9.32 14.42 9.68 14.79 L 14.04 19.14 L 22.32 10.87 C 22.68 10.5 23.28 10.5 23.64 10.87 C 24.01 11.23 24.01 11.82 23.64 12.19 Z M 23.64 12.19' />
    </g>
  </svg>
)

export default VerifiedIcon