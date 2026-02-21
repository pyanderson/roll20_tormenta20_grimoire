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

const ZOOM_DIV_ID = 'vm_zoom_buttons';
const BOOK_BUTTON_ID = 'tormenta20-book-button';
const BOOK_DIALOG_ID = 'tormenta20-dialog-book';
const BOOK_LIST_ID = 'tormenta20-book-list';

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
              createElement('tr', { append: createRow(row) }),
            ),
          }),
        ],
      }),
    ],
  });
}

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
      renderBookItem({ path: `${path}-${bookItem.name}`, bookItem: innerBookItem }),
    ),
  );
  folder.append(title, items);
  title.onclick = () => {
    folder
      .querySelector('.tormenta20-book-nested-folder')
      .classList.toggle('tormenta20-book-active-folder');
    title.classList.toggle('tormenta20-book-folder-open');
  };
  return folder;
}

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
  openDialog({ id: dialogId, title: bookItem.name, ...extraOptions });
}

function renderBookItem({ path, bookItem }) {
  if (bookItem.type === 'folder') return renderBookFolder({ path, bookItem });
  const dialogId = slugify(`${path}-${bookItem.name}`);
  const item = createElement('li', {
    classes: 'tormenta20-book-row journalitem dd-item',
  });
  const target = dialogId.split('-')[1];
  const draggableFolders = ['raas', 'classes', 'poderes', 'magias', 'equipamento'];
  const isDraggable = draggableFolders.indexOf(target) !== -1;
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
    draggable: isDraggable ? 'true' : 'false',
  });
  if (bookItem.type === 'item') item.append(icon);
  item.append(title);
  addEventObserver({
    el: title,
    eventName: 'dragstart',
    eventHandler: (e) => {
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify({ target, item: bookItem }),
      );
      e.dataTransfer.effectAllowed = 'copy';
    },
  });
  return item;
}

function createBookDialogContent({ bookItems }) {
  const search = (data, searchTerm) => {
    const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));
    const searchRecursive = (node) => {
      if (normalize(node.name).includes(searchTerm)) return deepCopy(node);
      if (node.type === 'folder') {
        const foundItems = node.items.map(searchRecursive).filter((item) => item !== null);
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
            ...searchResult.items.map((bookItem) => renderBookItem({ path: '', bookItem })),
          );
        }
      } else {
        clearChildren({ el: list });
        list.append(...bookItems.map((bookItem) => renderBookItem({ path: '', bookItem })));
      }
    },
  });
  return [input, list];
}

function createBookButton({ cssText, bookItems }) {
  const button = createElement('button', {
    id: BOOK_BUTTON_ID,
    classes: 'tormenta20-book-button',
    innerHTML: '<span class="tormenta20-book-button-tooltip">Clique para abrir o Grimório</span>',
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

export function loadBook({ bookItems, buttonIconURL, retry = 5 }) {
  const zoomDiv = document.getElementById(ZOOM_DIV_ID);
  if (!zoomDiv)
    return setTimeout(() => {
      loadBook({ bookItems, buttonIconURL, retry: retry - 1 });
    }, 1000);
  document.getElementById(BOOK_DIALOG_ID)?.parentNode?.remove();
  document.getElementById(BOOK_BUTTON_ID)?.remove();

  const calcPosValue = (valueInPx, extra = 0) =>
    `${parseInt(valueInPx.slice(0, -2)) + extra}px`;
  const zoomDivStyle = window.getComputedStyle(zoomDiv);
  const buttonCSSText = `
    position: absolute;
    right: ${calcPosValue(zoomDivStyle.getPropertyValue('right'), 6)};
    top: ${calcPosValue(zoomDivStyle.getPropertyValue('height'), 50)};
    z-index: ${zoomDivStyle.getPropertyValue('z-index')};
    background-image: url(${buttonIconURL});
  `;
  const button = createBookButton({ cssText: buttonCSSText, bookItems });
  zoomDiv.after(button);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutationRecord) => {
      button.style.right = calcPosValue(mutationRecord.target.style.right, 6);
    });
  });
  observer.observe(zoomDiv, { attributes: true, attributeFilter: ['style'] });
}