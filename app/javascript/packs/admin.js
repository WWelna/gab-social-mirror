'use strict';

import { delegate } from 'rails-ujs';

const batchCheckboxClassName = '.batch-checkbox input[type="checkbox"]';
const checkAllSelector = '[data-batch-checkbox-all]'

delegate(document, checkAllSelector, 'change', ({ target }) => {
  [].forEach.call(target.closest('form').querySelectorAll(batchCheckboxClassName), (content) => {
    content.checked = target.checked;
  });
});

delegate(document, batchCheckboxClassName, 'change', ({ target }) => {
  const checkAllElement = target.closest('form').querySelector(checkAllSelector)

  if (checkAllElement) {
    checkAllElement.checked = [].every.call(document.querySelectorAll(batchCheckboxClassName), (content) => content.checked);
    checkAllElement.indeterminate = !checkAllElement.checked && [].some.call(document.querySelectorAll(batchCheckboxClassName), (content) => content.checked);
  }
});

delegate(document, '.media-spoiler-show-button', 'click', () => {
  [].forEach.call(document.querySelectorAll('button.media-spoiler'), (element) => {
    element.click();
  });
});

delegate(document, '.media-spoiler-hide-button', 'click', () => {
  [].forEach.call(document.querySelectorAll('.spoiler-button.spoiler-button--visible button'), (element) => {
    element.click();
  });
});
