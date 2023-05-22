'use strict'

import {
  BREAKPOINT_EXTRA_LARGE,
  BREAKPOINT_LARGE,
  BREAKPOINT_MEDIUM,
  BREAKPOINT_SMALL,
  BREAKPOINT_EXTRA_SMALL,
} from '../constants'

export function isMobile(width) {
  return width <= BREAKPOINT_EXTRA_SMALL
}

export function breakpointExtraLarge(width) {
  return width > BREAKPOINT_EXTRA_LARGE
}

export function breakpointLarge(width) {
  return width < BREAKPOINT_LARGE
}

export function breakpointMedium(width) {
  return width < BREAKPOINT_MEDIUM
}

export function breakpointSmall(width) {
  return width < BREAKPOINT_SMALL
}

export function breakpointExtraSmall(width) {
  return width < BREAKPOINT_EXTRA_SMALL
}

export const getWindowDimension = () => {
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight

  return { width, height }
}

const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
const isVersion15 = /Version\/15/.test(navigator.userAgent)
const PWA = window.navigator && window.navigator.standalone

export function isIOS() {
  return iOS
}

export function isIOS15() {
  return iOS && isVersion15
}

export function isPWA() {
  return PWA
}

// check if we're using a touch screen
export function hasPointerEvents() {
  return (('PointerEvent' in window) || (window.navigator && 'msPointerEnabled' in window.navigator))
}

export function isTouch() {
  return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))
}

