'use strict';

import { addEventObserver, createElement } from './helpers';

/**
 * Get the highest z-index from a list of elements returned by an element except the node to skip.
 *
 * @param {object} props
 * @param {string} props.selector - The selector.
 * @param {HTMLElement} props.skipNode - The node to skip.
 * @returns {number}
 */
function getMaxZIndex({ selector, skipNode }) {
  return Array.from(document.querySelectorAll(selector))
    .filter((el) => !el.isSameNode(skipNode))
    .map((el) => parseInt(el.style.zIndex, 10) || 0)
    .reduce((max, zIndex) => Math.max(max, zIndex), 0);
}

/**
 * This method will look to all other dialog and update z index value to move it to the top.
 * The moveToTop native method do not work as expected.
 *
 * @param {object} props
 * @param {HTMLElement} props.dialog - The dialog element to be moved to the top.
 */
function moveDialogToTop({ dialog }) {
  const dialogZIndex = parseInt(dialog.style.zIndex, 10) || 0;
  const maxZIndex = getMaxZIndex({ selector: '.ui-dialog', skipNode: dialog });
  if (dialogZIndex === 0 || dialogZIndex < maxZIndex) {
    dialog.style.zIndex = maxZIndex + 1;
  }
}

/**
 * Create a new dialog if it does not exists.
 *
 * @param {object} props
 * @param {string} props.id - The dialog base id.
 * @param {string} props.title - The dialog title.
 * @param {HTMLElement[]} props.content - The list of elements to be added to the dialog content.
 * @param {number} [props.width=400] - The width of the dialog, in pixels..
 * @param {number} [props.height=400] - The height of the dialog, in pixels..
 * @param {boolean} [props.autoOpen=true] - If set to true, the dialog will automatically open upon initialization.
 * @param {boolean} [props.persists=false] - If set to true, the dialog will not be deleted after the close.
 * @param {boolean} [props.moveToTopOnClick=true] - If set to true, the dialog will be moved to top always it receives a click event..
 */
export function openDialog({
  id,
  title,
  content,
  width = 400,
  height = 400,
  autoOpen = true,
  persists = false,
  moveToTopOnClick = true,
}) {
  const currentDialogBase = document.getElementById(id);
  if (currentDialogBase) {
    $(currentDialogBase).dialog().dialog('open');
    moveDialogToTop({ dialog: currentDialogBase.parentNode });
    return;
  }
  const dialogOptions = {
    title,
    width,
    height,
    autoOpen,
    closeText: '',
    classes: {
      'ui-dialog-titlebar':
        'ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix ui-draggable-handle',
      'ui-dialog-titlebar-close': 'ui-dialog-titlebar-close ui-corner-all',
    },
    close: () => {
      if (!persists) {
        const base = document.getElementById(id);
        if (base) {
          $(base).dialog().dialog('destroy');
          base.remove();
        }
      }
    },
  };
  const dialogBase = createElement('div', { id, append: content });
  document.body.append(dialogBase);
  $(dialogBase).dialog(dialogOptions);
  moveDialogToTop({ dialog: dialogBase.parentNode });
  if (moveToTopOnClick) {
    addEventObserver({
      el: dialogBase.parentNode,
      eventName: 'click',
      eventHandler: () => {
        if (dialogBase.parentNode) {
          moveDialogToTop({ dialog: dialogBase.parentNode });
        }
      },
    });
  }
}
