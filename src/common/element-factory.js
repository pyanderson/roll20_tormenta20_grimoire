'use strict';
/* common/constants vars */
/* global BOOK_BUTTON_ID,BOOK_DIALOG_ID,BOOK_LIST_ID */
/* common/helpers vars */
/* global createElement,slugify,setInputValue */
/* common/dialog-manager vars  */
/* global openDialog */

/**
 * Create the the CD row element.
 *
 * @returns {HTMLDivElement}
 */
// eslint-disable-next-line no-unused-vars
function createCDRow() {
  const content = `
  <span class="spell-cd-item">CD</span>
    <input class="spell-cd-item spell-cd-total" style="margin-right: 5px; border: 2px solid black;" disabled="" value="" maxlength="2" name="spell-cd-total">
    <div class="spell-cd-item">=</div>
    <select class="spell-cd-item spell-cd-bottom-border spell-cd-attr" style="margin-right: 5px" name="spell-cd-attr">
        <option value="int">INT</option>
        <option value="sab">SAB</option>
        <option value="car">CAR</option>
        <option value="for">FOR</option>
        <option value="des">DES</option>
        <option value="con">CON</option>
    </select>
    <div class="spell-cd-item">+</div>
    <input class="spell-cd-item spell-cd-bottom-border spell-cd-extra" maxlength="2" type="text" spellcheck="false" value="0" name="spell-cd-extra">
  `;
  return createElement('div', {
    classes: 'sheet-default-title spell-cd',
    name: 'spell-cd',
    innerHTML: content.trim(),
  });
}

/**
 * Create the spell dialog element.
 *
 * @param {object} props
 * @param {string} props.circle - The spell circle [1, 2, 3, 4, 5].
 * @param {string[]} props.options - All available spell names for the circle.
 * @returns {HTMLDivElement}
 */
// eslint-disable-next-line no-unused-vars
function createSpellDialog({ circle, options }) {
  const content = `
  <form name="spell-form">
    <fieldset>
      <label>
        <b>Nome</b><br>
        <input list="list-${circle}-spells" type="text" name="spell-name" value="" autocomplete="off">
        <datalist id="list-${circle}-spells">
        ${options.map((option) => `<option value="${option}">`).join('')}
         </datalist>
      </label>
      <!-- Allow form submission with keyboard without duplicating the dialog button -->
      <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
    </fieldset>
  </form>
  `;
  return createElement('div', {
    name: 'spell-dialog',
    title: `${circle}º Círculo`,
    innerHTML: content.trim(),
  });
}

/**
 * Create the power dialog element.
 *
 * @param {object} props
 * @param {string[]} props.options - All available powers names.
 * @returns {HTMLDivElement}
 */
// eslint-disable-next-line no-unused-vars
function createPowerDialog({ options }) {
  const content = `
  <form name="power-form">
    <fieldset>
      <label>
        <b>Nome</b><br>
        <input list="list-powers" type="text" name="power-name" value="" autocomplete="off">
        <datalist id="list-powers">
        ${options.map((option) => `<option value="${option}">`).join('')}
         </datalist>
      </label>
      <!-- Allow form submission with keyboard without duplicating the dialog button -->
      <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
    </fieldset>
  </form>
  `;
  return createElement('div', {
    name: 'power-dialog',
    title: 'Habilidade ou Poder',
    innerHTML: content.trim(),
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
 * Render the book item as a <li> element.
 *
 * @param {object} props
 * @param {string} props.path - The path to access the book item.
 * @param {BookItem} props.bookItem - The book item.
 * @returns {HTMLLIElement}
 */
function openBookItemDialog({ dialogId, bookItem }) {
  const extraOptions =
    bookItem.type === 'item'
      ? {
          content: bookItem.description
            .split('\n\n')
            .map((line) => createElement('p', { innerHTML: line.trim() })),
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
  return createElement('ul', {
    id: BOOK_LIST_ID,
    classes: 'dd-list dd folderroot',
    append: bookItems.map((bookItem) => renderBookItem({ path: '', bookItem })),
  });
}

/**
 * Create the book buuton.
 *
 * @param {object} props
 * @param {string} props.cssText - The button css as string.
 * @param {BookItem[]} props.bookItems - The book items list.
 * @returns {HTMLUListElement}
 */
// eslint-disable-next-line no-unused-vars
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
      content: [createBookDialogContent({ bookItems })],
    });
  };
  return button;
}
