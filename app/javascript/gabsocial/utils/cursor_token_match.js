'use strict'

const searchTokens = ['@', ':']

/**
 * Used in the draft-js composer to find a 'token' used to search for accounts
 * or emojis.
 * @method textAtCursorMatchesToken
 * @param {string} str composer text
 * @param {number} cursorPosition
 * @returns {array} tuple position, token
 */
export function textAtCursorMatchesToken(str, cursorPosition) {
  let word

  let left = str.slice(0, cursorPosition).search(/\S+$/)
  let right = str.slice(cursorPosition).search(/\s/)

  if (right < 0) {
    word = str.slice(left)
  } else {
    word = str.slice(left, right + cursorPosition)
  }

  if (!word || word.trim().length < 2 || searchTokens.indexOf(word[0]) === -1) {
    return [null, null]
  }

  word = word.trim().toLowerCase()

  if (word.length > 0) {
    return [left + 1, word]
  }

  return [null, null]
}
