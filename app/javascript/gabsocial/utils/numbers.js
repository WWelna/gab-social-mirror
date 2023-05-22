import React from 'react'
import { FormattedNumber } from 'react-intl'

export const shortNumberFormat = (number) => {
  if (isNaN(number)) {
    return <FormattedNumber value={0} />
  }
  
  if (number < 1000) {
    try {
      return (<FormattedNumber value={number} />).props.value
    } catch (error) {
      return <FormattedNumber value={0} />
    }
  }

  const isMillions = number > 999999
  const isThousands = number > 999 && !isMillions
  const divisor = isMillions ? 1000000 : isThousands ? 1000 : 1
  const suffix = isMillions ? 'm' : isThousands ? 'k' : ''
  return (
    <React.Fragment>
      <FormattedNumber value={number / divisor} maximumFractionDigits={1} />{suffix}
    </React.Fragment>
  )
}

export const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Randomize the items in an array. Warning: mutates existing array. It does
 * not return anything. Array.prototype.sort also mutates.
 *
 * Usage:
 * const items = [1, 2, 3]
 * shuffle(items)
 *
 * Alternatively you can try: [1, 2, 3].sort(() => 0.5 - Math.random())
 *
 * It will not be really random like that. Fisher-Yates algorithm explained:
 * http://www.robweir.com/blog/2010/02/microsoft-random-browser-ballot.html
 * https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
 *
 * TODO replace with lodash shuffle
 * @param {array} arr
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
}
