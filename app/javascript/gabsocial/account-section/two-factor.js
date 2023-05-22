import isNil from 'lodash/isNil'
import { createConfirm } from './confirms'

/**
 * The form showing the QR code, textbox, and Enable form.
 */
let twoFactorForm

function twoFactorForm_submit(evt) {
  function onConfirm() {
    const hiddenRemove = document.createElement('input')
    hiddenRemove.setAttribute('type', 'hidden')
    hiddenRemove.setAttribute('name', 'revoke_all_sessions')
    hiddenRemove.setAttribute('value', '1')
    twoFactorForm.appendChild(hiddenRemove)
    twoFactorForm.submit()
  }
  
  function onCancel() {
    twoFactorForm.submit()
  }
  
  const message = 'Also log out all other sessions and devices except this one?'
  const cancel = 'No'
  createConfirm({ message, cancel, onConfirm, onCancel })
  evt.preventDefault()
  return false
}

export default function start() {
  // set the theme like the normal app so the modal styles work
  document.querySelector('html').setAttribute('theme', 'muted')
  
  twoFactorForm = document.getElementById('new_form_two_factor_confirmation')
  if (isNil(twoFactorForm) === false) {
    twoFactorForm.addEventListener('submit', twoFactorForm_submit)
  }
}
