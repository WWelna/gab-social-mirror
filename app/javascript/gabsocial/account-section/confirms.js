import isNil from 'lodash/isNil'
import isFunction from "lodash/isFunction"
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { IntlProvider } from 'react-intl'
import { ModalBaseRaw } from '../components/modal/modal_base'
import ConfirmationModal from '../components/modal/confirmation_modal'

let modalInject = document.querySelector('#modal-inject')

if (isNil(modalInject)) {
  modalInject = document.createElement('div')
  modalInject.setAttribute('id', 'modal-inject')
  document.body.appendChild(modalInject)
}

export const AccountSectionConfirm = ({
  // event handelers
  onClose,
  onConfirm,
  onCancel,
  
  // text content
  message,
  confirm = 'Yes',
  cancel
}) =>
  <ModalBaseRaw onClose={onClose}>
    <IntlProvider>
      <ConfirmationModal
        message={message}
        confirm={confirm}
        cancel={cancel}
        onClose={onClose}
        onConfirm={() => {
          onConfirm()
          onClose()
        }}
        onCancel={() => {
        // passing onCancel is optional
          if (isFunction(onCancel)) {
            onCancel()
          }
          onClose()
        }}
      />
    </IntlProvider>
  </ModalBaseRaw>

/**
 * Override ./public/legacy/default.css
 */
export function styleOverrides() {
  Array.from(
    document.querySelectorAll('#modal-inject span, #modal-inject button')
  ).forEach(function(el) {
    el.style.fontSize = '15px'
  })
}

/**
 * Create and mount a simple react app just for our modals. Close and clean
 * it up when finished.
 */
export function createConfirm({
  message,
  confirm,
  cancel,
  onConfirm,
  onCancel
}) {
  const onClose = () => unmountComponentAtNode(modalInject)
  
  render(
    <AccountSectionConfirm
      message={message}
      confirm={confirm}
      cancel={cancel}
      onClose={onClose}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
    modalInject
  )

  styleOverrides()
}
