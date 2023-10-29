'use strict';
/* common/constants vars */
/* global TEXTCHAT_DIV_ID */
/* common/helpers vars */
/* global createElement,addEventObserver,slugify */
/* common/element-factory vars */
/* global openBookItemDialog */

/**
 * Replace all conditions text in a message with a button that opens a dialog with the details.
 *
 * @param {object} props
 * @param {HTMLDivElement} message - The roll20 chat message.
 * @param {object} conditionsMap - All conditions. TODO: Document
 */
function enhanceMessage({ message, conditionsMap }) {
  Object.keys(conditionsMap).map((condition) => {
    for (const button of message.querySelectorAll(
      'button.tormenta20-chat-button',
    )) {
      if (button.textContent.toLowerCase() === condition.toLowerCase())
        return false;
    }
    const regex = new RegExp(`\\b${condition}\\b`, 'gi');
    message.innerHTML = message.innerHTML.replace(regex, (match) => {
      const button = createElement('button', {
        classes: 'tormenta20-chat-button',
        textContent: match,
      });
      return button.outerHTML;
    });
    return true;
  });
  for (const button of message.querySelectorAll(
    'button.tormenta20-chat-button',
  )) {
    addEventObserver({
      el: button,
      eventName: 'click',
      eventHandler: (event) => {
        const condition = conditionsMap[event.target.textContent.toLowerCase()];
        if (condition) {
          openBookItemDialog({
            dialogId: slugify(`-Condições-${condition.name}`),
            bookItem: condition,
          });
        }
      },
    });
  }
}

/**
 * Adds the ability to view condition details when clicking a condition name in chat.
 *
 * @param {object} props
 * @param {BookItem[]} props.bookItems - The t20 book as list of folders.
 */
// eslint-disable-next-line no-unused-vars
function loadChatEnhancement({ bookItems }) {
  const conditionsMap = bookItems
    .find((folder) => folder.name === 'Condições')
    .items.reduce((acc, item) => {
      acc[item.name.toLowerCase()] = item;
      return acc;
    }, {});
  const chat = document.getElementById(TEXTCHAT_DIV_ID);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (
            node.classList &&
            node.classList.contains('message') &&
            node.classList.contains('general')
          ) {
            enhanceMessage({ message: node, conditionsMap });
          }
        }
      }
    }
  });

  observer.observe(chat.querySelector('.content'), {
    attributes: false,
    childList: true,
    subtree: false,
  });

  // Enhance current messages.
  const messages = chat.querySelectorAll('.message.general');
  for (const message of messages) {
    enhanceMessage({ message, conditionsMap });
  }
}
