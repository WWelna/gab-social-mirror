import React from 'react'
import PlaceholderLayout from './placeholder_layout'

const rows = 3
const columns = 3
const size = 70
const boxes =[]
const pad = 15

for(let row = 0; row < rows; row += 1) {
  for(let column = 0; column < columns; column += 1) {
    boxes.push(
      <rect
        key={`mgpp-${row}-${column}`}
        x={parseInt(column * size + 8)}
        y={parseInt(row * size + 5)}
        rx='4'
        ry='4'
        width={parseInt(size - pad)}
        height={parseInt(size - pad)}
      />
    )
  }
}

const placeholder = (
  <div className={[_s.d, _s.w100PC].join(' ')} style={{ paddingLeft: "5px" }}>
    <PlaceholderLayout viewBox={`0 0 ${columns * size} ${rows * size}`}>
      {boxes}
    </PlaceholderLayout>
  </div>
)

const MediaGalleryPanelPlaceholder = () => placeholder

export default MediaGalleryPanelPlaceholder
