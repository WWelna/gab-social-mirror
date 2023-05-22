import isNil from 'lodash/isNil'
import { createConfirm } from './confirms'

let changePasswordForm
let sessionsRemoveAll

function changePasswordForm_submit(evt) {
  function onConfirm() {
    const hiddenRemove = document.createElement('input')
    hiddenRemove.setAttribute('type', 'hidden')
    hiddenRemove.setAttribute('name', 'revoke_all_sessions')
    hiddenRemove.setAttribute('value', '1')
    changePasswordForm.appendChild(hiddenRemove)
    changePasswordForm.submit()
  }
  
  function onCancel() {
    changePasswordForm.submit()
  }
  
  const message = 'Also log out all other sessions and devices except this one?'
  const cancel = 'No'
  createConfirm({ message, cancel, onConfirm, onCancel })
  evt.preventDefault()
  return false
}

function sessionsRemoveAll_click(evt) {
  function onConfirm() {
    document.querySelector('.hidden-delete-all-form').submit()
  }
  
  const message = 'Log out all other sessions and devices except this one?'
  createConfirm({ message, onConfirm })
  evt.preventDefault()
  return false
}

export default function start() {
  // set the theme like the normal app so the modal styles work
  document.querySelector('html').setAttribute('theme', 'muted')
  
  changePasswordForm = document.getElementById('edit_user')
  if (isNil(changePasswordForm) === false) {
    changePasswordForm.addEventListener('submit', changePasswordForm_submit)
  }
  
  // ✖️ Revoke all sessions button
  sessionsRemoveAll = document.getElementById('sessions_remove_all')
  if (isNil(sessionsRemoveAll) === false) {
    sessionsRemoveAll.addEventListener('click', sessionsRemoveAll_click)
  }
}
