'use strict';

import { openDialog } from '../common/dialog-manager';
import {
  addEventObserver,
  clearChildren,
  createElement,
  normalize,
  setInputValue,
  slugify,
} from '../common/helpers';

const ZOOM_DIV_ID = 'zoomclick';
const BOOK_BUTTON_ID = 'tormenta20-book-button';
const BOOK_DIALOG_ID = 'tormenta20-dialog-book';
const BOOK_LIST_ID = 'tormenta20-book-list';

/**
 * Create a table element from a string in the TSV format.
 *
 * @param {object} props
 * @param {string} props.content - Table content.
 * @returns {HTMLDivElement|null}
 */
function createTableFromTSV({ content }) {
  const lines = content.split('\n');
  if (lines.length <= 1) return null;
  const [header, ...rows] = lines;
  const columns = header.split('\t');
  const createRow = (row) => {
    const cells = row.split('\t');
    if (cells.length < columns.length)
      return [
        createElement('td', {
          innerHTML: cells[0].trim(),
          colspan: `${columns.length - cells.length + 1}`,
          align: cells.length === 1 ? 'center' : 'left',
        }),
        ...cells
          .slice(1)
          .map((cell) => createElement('td', { innerHTML: cell.trim() })),
      ];
    return cells.map((cell) => createElement('td', { innerHTML: cell.trim() }));
  };
  return createElement('div', {
    classes: 'content note-editor notes',
    append: [
      createElement('table', {
        classes: 'userscript-table userscript-table-bordered',
        append: [
          createElement('thead', {
            append: [
              createElement('tr', {
                append: columns.map((column) =>
                  createElement('th', { innerHTML: column.trim() }),
                ),
              }),
            ],
          }),
          createElement('tbody', {
            append: rows.map((row) =>
              createElement('tr', {
                append: createRow(row),
              }),
            ),
          }),
        ],
      }),
    ],
  });
}

/**
 * Render the book folder as a <li> element;
 *
 * @param {object} props
 * @param {string} props.path - The path to access the book item.
 * @param {BookItem} props.bookItem - The book item.
 * @returns {HTMLLIElement}
 */
function renderBookFolder({ path, bookItem }) {
  const folder = createElement('li', { classes: 'dd-item dd-folder' });
  const title = createElement('span', {
    classes: 'tormenta20-book-folder dd-content',
    innerHTML: bookItem.name,
  });
  const items = createElement('ul', {
    classes: 'tormenta20-book-nested-folder',
  });
  items.append(
    ...bookItem.items.map((innerBookItem) =>
      renderBookItem({
        path: `${path}-${bookItem.name}`,
        bookItem: innerBookItem,
      }),
    ),
  );

  folder.append(title, items);
  // active tree view
  title.onclick = () => {
    folder
      .querySelector('.tormenta20-book-nested-folder')
      .classList.toggle('tormenta20-book-active-folder');
    title.classList.toggle('tormenta20-book-folder-open');
  };
  return folder;
}

/**
 * Render the book item as a <li> element.
 *
 * @param {object} props
 * @param {string} props.path - The path to access the book item.
 * @param {BookItem} props.bookItem - The book item.
 * @returns {HTMLLIElement}
 */
export function openBookItemDialog({ dialogId, bookItem }) {
  const extraOptions =
    bookItem.type === 'item'
      ? {
          content: [
            ...bookItem.description
              .split('\n\n')
              .map((line) => createElement('p', { innerHTML: line.trim() })),
            ...(bookItem.implements || []).map((implement) =>
              createElement('p', {
                innerHTML: `${implement.cost}: ${implement.description}`,
              }),
            ),
          ],
          width: 400,
          height: 200,
        }
      : {
          content: [createTableFromTSV({ content: bookItem.content })],
          width: 600,
          height: 400,
        };
  openDialog({
    id: dialogId,
    title: bookItem.name,
    ...extraOptions,
  });
}

/**
 * Render the book item as a <li> element.
 *
 * @param {object} props
 * @param {string} props.path - The path to access the book item.
 * @param {BookItem} props.bookItem - The book item.
 * @returns {HTMLLIElement}
 */
function renderBookItem({ path, bookItem }) {
  if (bookItem.type === 'folder') return renderBookFolder({ path, bookItem });
  const dialogId = slugify(`${path}-${bookItem.name}`);
  const item = createElement('li', {
    classes: 'tormenta20-book-row journalitem dd-item',
  });
  const icon = createElement('div', {
    name: 'tormenta20-chat-info-button',
    classes: 'tormenta20-book-chat-icon',
    onclick: () => {
      setInputValue({
        selector: '#textchat-input .ui-autocomplete-input',
        value: `&{template:t20-info}{{infoname=${bookItem.name}}}{{description=${bookItem.description}}}`,
      });
      document.querySelector('#textchat-input .btn').click();
    },
    append: [createElement('a', { classes: 'pictos', innerHTML: 'q' })],
  });
  const title = createElement('div', {
    name: 'tormenta20-dialog-info-button',
    classes: 'tormenta20-book-item-name dd-content',
    innerHTML: bookItem.name,
    onclick: () => openBookItemDialog({ dialogId, bookItem }),
  });
  if (bookItem.type === 'item') item.append(icon);
  item.append(title);
  return item;
}

/**
 * Generate the book dialog content.
 *
 * @param {object} props
 * @param {BookItem[]} props.bookItems - The book items list.
 * @returns {HTMLUListElement}
 */
function createBookDialogContent({ bookItems }) {
  const search = (data, searchTerm) => {
    const deepCopy = (obj) => {
      return JSON.parse(JSON.stringify(obj));
    };
    const searchRecursive = (node) => {
      if (normalize(node.name).includes(searchTerm)) {
        return deepCopy(node);
      }
      if (node.type === 'folder') {
        const foundItems = node.items
          .map(searchRecursive)
          .filter((item) => item !== null);
        if (foundItems.length > 0) {
          const folderCopy = deepCopy(node);
          folderCopy.items = foundItems.map(deepCopy);
          return folderCopy;
        }
      }
      return null;
    };
    const result = searchRecursive({ type: 'folder', name: '', items: data });
    if (result && result.items.length === 0) return null;
    return result;
  };

  const list = createElement('ul', {
    id: BOOK_LIST_ID,
    classes: 'dd-list dd folderroot',
    append: bookItems.map((bookItem) => renderBookItem({ path: '', bookItem })),
  });
  const input = createElement('input', {
    classes: 'ui-autocomplete-input',
    autocomplete: 'off',
    type: 'text',
    placeholder: 'Search by name...',
  });
  addEventObserver({
    el: input,
    eventName: 'input',
    eventHandler: () => {
      const searchTerm = normalize(input.value);
      if (searchTerm && searchTerm.length >= 2) {
        const searchResult = search(bookItems, searchTerm);
        clearChildren({ el: list });
        if (searchResult) {
          list.append(
            ...searchResult.items.map((bookItem) =>
              renderBookItem({ path: '', bookItem }),
            ),
          );
        }
      } else {
        clearChildren({ el: list });
        list.append(
          ...bookItems.map((bookItem) =>
            renderBookItem({ path: '', bookItem }),
          ),
        );
      }
    },
  });
  return [input, list];
}

/**
 * Create the book buuton.
 *
 * @param {object} props
 * @param {string} props.cssText - The button css as string.
 * @param {BookItem[]} props.bookItems - The book items list.
 * @returns {HTMLUListElement}
 */
function createBookButton({ cssText, bookItems }) {
  const button = createElement('button', {
    id: BOOK_BUTTON_ID,
    classes: 'tormenta20-book-button',
    innerHTML:
      '<span class="tormenta20-book-button-tooltip">Clique para abrir o Grimório</span>',
  });
  button.style.cssText = cssText;
  button.onclick = () => {
    openDialog({
      id: BOOK_DIALOG_ID,
      title: 'Grimório do Tormenta20',
      width: 400,
      height: 500,
      persists: true,
      moveToTopOnClick: false,
      content: createBookDialogContent({ bookItems }),
    });
  };
  return button;
}

/**
 * Load the book feature.
 * Add the book button and the book functionalities.
 *
 * @param props
 * @param {BookItem[]} props.bookItems - The book items list.
 * @param {string} props.buttonIconURL - The URL to the icon in the extension files.
 * @param {number} props.retry - Number of retries.
 */
export function loadBook({ bookItems, buttonIconURL, retry = 5 }) {
  const zoomDiv = document.getElementById(ZOOM_DIV_ID);
  // Wait until the zoom button is available
  if (!zoomDiv)
    // wait one second and try again
    return setTimeout(() => {
      loadBook({ bookItems, buttonIconURL, retry: retry - 1 });
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
    background-image: url(${buttonIconURL});
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
