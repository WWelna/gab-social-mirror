'use strict';

import { me } from '../initial_state'
import {
  LOCAL_STORAGE_BLOCKS,
  LOCAL_STORAGE_MUTES,
  LOCAL_STORAGE_BLOCKED_BY,
  LOCAL_STORAGE_GROUP_BLOCKS,
} from '../constants'

// helpers
function getLocalStorageValueAsArray(key) {
  let existing = localStorage.getItem(key)
  return !!existing ? existing.split(',') : []
}

function getLocalStorageIds(key, accountId) {
  if (!me || !accountId) return false
  const value = getLocalStorageValueAsArray(key)
  return value.includes(accountId)
}

function setLocalStorageIds(key, ids) {
  localStorage.setItem(key, ids)
}

function appendLocalStorageId(key, id) {
  const value = getLocalStorageValueAsArray(key)

  // push unique
  if (value && value.every(existingId => existingId !== id)) {
    value.push(id)
  }

  localStorage.setItem(key, value)
}

function removeLocalStorageId(key, id) {
  const value = getLocalStorageValueAsArray(key)

  const existingIdIndex = value.indexOf(id)
  value.splice(existingIdIndex, 1)

  localStorage.setItem(key, value)
}

/**
 * blocking
 */
export function isBlockingId(accountId) {
  return getLocalStorageIds(LOCAL_STORAGE_BLOCKS, accountId)
}

export function setIsBlockingIds(ids) {
  setLocalStorageIds(LOCAL_STORAGE_BLOCKS, ids)
}

export function appendIsBlockingId(id) {
  appendLocalStorageId(LOCAL_STORAGE_BLOCKS, id)
}

export function removeIsBlockingId(id) {
  removeLocalStorageId(LOCAL_STORAGE_BLOCKS, id)
}

export function setIsBlockingGroupIds(ids) {
  setLocalStorageIds(LOCAL_STORAGE_GROUP_BLOCKS, ids)
}

export function appendIsBlockingGroupId(id) {
  appendLocalStorageId(LOCAL_STORAGE_GROUP_BLOCKS, id)
}

export function isBlockingGroupId(groupId) {
  return getLocalStorageIds(LOCAL_STORAGE_GROUP_BLOCKS, groupId)
}

export function removeIsBlockingGroupId(groupId) {
  removeLocalStorageId(LOCAL_STORAGE_GROUP_BLOCKS, groupId)
}

/**
 * muting
 */
export function isMutingId(accountId) {
  return getLocalStorageIds(LOCAL_STORAGE_MUTES, accountId)
}

export function setIsMutingIds(ids) {
  setLocalStorageIds(LOCAL_STORAGE_MUTES, ids)
}

export function appendIsMutingId(id) {
  appendLocalStorageId(LOCAL_STORAGE_MUTES, id)
}

export function removeIsMutingId(id) {
  removeLocalStorageId(LOCAL_STORAGE_MUTES, id)
}

/**
 * blocked by
 */
 export function isBlockedById(accountId) {
  return getLocalStorageIds(LOCAL_STORAGE_BLOCKED_BY, accountId)
}

export function setIsBlockedByIds(ids) {
  setLocalStorageIds(LOCAL_STORAGE_BLOCKED_BY, ids)
}