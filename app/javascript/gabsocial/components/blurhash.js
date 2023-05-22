import React, { useRef, useEffect }  from 'react'
import PropTypes from 'prop-types'
import { decode } from 'blurhash'

const Blurhash = ({
  hash,
  className,
}) => {
  const canvasRef = useRef()

  useEffect(() => {
    if (!hash) return

    const { current: canvas } = canvasRef
    canvas.width = canvas.width

    try {
      const ctx = canvas.getContext('2d')
      ctx.putImageData(new ImageData(decode(hash, 32, 32), 32, 32), 0, 0)
    } catch (err) {
      //
    }
  }, [hash])

  return <canvas className={className} ref={canvasRef} width={32} height={32} />
}

Blurhash.propTypes = {
  hash: PropTypes.string.isRequired,
}

export default Blurhash