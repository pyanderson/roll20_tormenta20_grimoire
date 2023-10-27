/*
 *
 * @param {object[]} bookItems - List of book item.
 * @param {string} bookItems[].type - The book item type, can be 'item' or 'folder'.
 * @param {string} bookItems[].name - The book item name.
 * @param {object[]} bookItems[].items - If the book item type is 'folder', this is a list of book item.
 * @param {string} bookItems[].description - If the book item type is 'item', this is the description of the book item.
 * @param {number} retry - The number of remaining attempts.
 * */
function addBookButton(bookItems, retry = 5) {
  const zoomDiv = document.getElementById(ZOOM_DIV_ID);
  // Wait until the zoom button is available
  if (!zoomDiv)
    // wait one second and try again
    return setTimeout(() => {
      addBookButton(retry - 1);
    }, 1000);
  // Remove the old button and old dialog if it exists, this is useful during development where you need to reload the extension several times
  document.getElementById(BOOK_DIALOG_ID)?.remove();
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
  const button = generateBookButton();
  button.style.cssText = buttonCSSText;
  button.onclick = () => {
    const dialogOptions = {
      autoOpen: true,
      closeText: '',
      height: 500,
      width: 400,
      classes: {
        'ui-dialog-titlebar':
          'ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix ui-draggable-handle',
        'ui-dialog-titlebar-close': 'ui-dialog-titlebar-close ui-corner-all',
      },
    };
    const currentDialog = document.getElementById(BOOK_DIALOG_ID);
    if (currentDialog) {
      $(currentDialog).dialog(dialogOptions).dialog('open');
      return;
    }
    // If do not exists a dialog
    const dialog = createElement('div', {
      id: BOOK_DIALOG_ID,
      title: 'Grimório do Tormenta20',
      append: [generateBookDialogContent(bookItems)],
    });
    document.body.append(dialog);
    $(dialog).dialog(dialogOptions);
  };
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

/*
 * Load the book data and add the book button.
 *
 * */
function loadBook() {
  fetch(chrome.runtime.getURL(BOOK_PATH))
    .then((response) => response.json())
    .then((bookItems) => {
      fetch(chrome.runtime.getURL(TABLES_PATH))
        .then((response) => response.json())
        .then((tables) => {
          addBookButton([...bookItems, tables]);
        });
    });
}
