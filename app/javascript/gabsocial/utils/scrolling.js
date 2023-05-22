//t = current time
//b = start value
//c = change in value
//d = duration
function easeInOutQuad(t, b, c, d) {
  t /= d / 2
  if (t < 1) return c / 2 * t * t + b
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

// https://gist.github.com/andjosh/6764939
export const scrollTo = (element, to, duration = 0) => {
  var start = element.scrollTop,
    change = to - start,
    currentTime = 0,
    increment = 20

  var animateScroll = function () {
    currentTime += increment
    var val = easeInOutQuad(currentTime, start, change, duration)
    element.scrollTop = val
    if (currentTime < duration) {
      setTimeout(animateScroll, increment)
    }
  }

  animateScroll()
}

/*

Traverse up finding the nearest scrollable parent element.

Copied from:
https://htmldom.dev/get-the-first-scrollable-parent-of-an-element/

*/

function isScrollable(el) {
  const scrollableParentDataset = el.dataset.scrollableParent
  const hasScrollableContent = el.scrollHeight > el.clientHeight
  const overflowYStyle = typeof window.getComputedStyle === 'function' ?
    window.getComputedStyle(el).overflowY : ''
  const isOverflowHidden = overflowYStyle.includes('hidden')
  return scrollableParentDataset || (hasScrollableContent && !isOverflowHidden)
}

export function getScrollableParent(el) {
  const defaultElement = document.scrollingElement || document.documentElement
  if (!el || el.isSameNode(defaultElement)) {
    return defaultElement
  }
  if (isScrollable(el)) {
    return el
  }
  return getScrollableParent(el.parentNode)
}
