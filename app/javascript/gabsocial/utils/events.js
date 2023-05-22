/**
 * Dispatch a window event if it's available. It's used as a way to communicate
 * between componens when redux is too difficult.
 * @method dispatchWindowEvent
 * @param {string} name
 * @param {object} evt
 */
export function dispatchWindowEvent(name, evt) {
  if (
    typeof window.dispatchEvent === 'function' &&
    typeof CustomEvent === 'function'
  ) {
    window.dispatchEvent(new CustomEvent(name, { detail: evt }))
  }
}
