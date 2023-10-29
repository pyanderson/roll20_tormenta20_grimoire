'use strict';
/* common/constants vars */
/* global ZOOM_DIV_ID,BOOK_DIALOG_ID,BOOK_BUTTON_ID,ICON_PATH */
/* common/helpers vars */
/* common/element-factory vars */
/* global createBookButton  */

/**
 * Load the book feature.
 * Add the book button and the book functionalities.
 *
 * @param props
 * @param {BookItem[]} props.bookItems - The book items list.
 * @param {number} props.retry - Number of retries.
 */
// eslint-disable-next-line no-unused-vars
function loadBook({ bookItems, retry = 5 }) {
  const zoomDiv = document.getElementById(ZOOM_DIV_ID);
  // Wait until the zoom button is available
  if (!zoomDiv)
    // wait one second and try again
    return setTimeout(() => {
      loadBook({ bookItems, retry: retry - 1 });
    }, 1000);
  // Remove the old button and old dialog if it exists, this is useful during development where you need to reload the extension several times
  document.getElementById(BOOK_DIALOG_ID)?.parentNode?.remove();
  document.getElementById(BOOK_BUTTON_ID)?.remove();

  const calcRightValue = (valueInPx) =>
    `${parseInt(valueInPx.slice(0, -2)) + 25}px`;
  // Get the initial style
  const zoomDivStyle = window.getComputedStyle(zoomDiv);
  const buttonCSSText = `
    position: absolute;
    right: ${calcRightValue(zoomDivStyle.getPropertyValue('right'))};
    top: ${zoomDivStyle.getPropertyValue('height')};
    z-index: ${zoomDivStyle.getPropertyValue('z-index')};
    background-image: url(${chrome.runtime.getURL(ICON_PATH)});
  `;
  // Create the button and add it to the page
  const button = createBookButton({ cssText: buttonCSSText, bookItems });

  zoomDiv.after(button);

  // Start observing the zoom div change so the button can follow it
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutationRecord) => {
      button.style.right = calcRightValue(mutationRecord.target.style.right);
    });
  });
  observer.observe(zoomDiv, {
    attributes: true,
    attributeFilter: ['style'],
  });
}
