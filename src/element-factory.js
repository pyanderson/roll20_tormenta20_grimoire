/*
 * Generate the the CD row element.
 *
 * @returns {HTMLDivElement}
 * */
function generateCDRow() {
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

/*
 * Generate the spell dialog element.
 *
 * @param {string} circle - The spell circle.
 * @param {string[]} options - All available spell names for the circle.
 * @returns {HTMLDivElement}
 * */
function generateSpellDialog(circle, options) {
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

/*
 * Generate the power dialog element.
 *
 * @param {string[]} options - All available powers names.
 * @returns {HTMLDivElement}
 * */
function generatePowerDialog(options) {
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

/*
 * Generate the customized button to be used to open the book dialog.
 *
 * @returns {HTMLButtonElement}
 * */
function generateBookButton() {
  return createElement('button', {
    id: BOOK_BUTTON_ID,
    classes: 'tormenta20-book-button',
    append: [
      createElement('span', {
        classes: 'tormenta20-book-button-tooltip',
        innerHTML: 'Clique para abrir o Grimório',
      }),
    ],
  });
}

/*
 * Render the book folder as a <li> element;
 *
 * @param {string} path - The path to access the book item.
 * @param {object} bookItem - The book item.
 * @param {string} bookItem.name - The book item name.
 * @param {object[]} bookItems[].items - If the book item type is 'folder', this is a list of book item.
 * @returns {HTMLLIElement}
 * */
function renderBookFolder(path, bookItem) {
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
      renderBookItem(`${path}-${bookItem.name}`, innerBookItem),
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

/*
 * Generate a table element from a string in the TSV format.
 *
 * @param {string} content - Table content.
 * @returns {HTMLDivElement|null}
 * */
function generateTableFromTSV(content) {
  const lines = content.split('\n');
  if (lines.length <= 1) return null;
  const [header, ...rows] = lines;
  const columns = header.split('\t');
  const generateRow = (row) => {
    const cells = row.split('\t');
    if (cells.length < columns.length)
      return [
        createElement('td', {
          innerHTML: cells[0].trim(),
          colspan: `${columns.length - cells.length + 1}`,
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
                append: generateRow(row),
              }),
            ),
          }),
        ],
      }),
    ],
  });
}

/*
 * Render the book item as a <li> element.
 *
 * @param {string} path - The path to access the book item.
 * @param {object} bookItem - The book item.
 * @param {string} bookItem.type - The book item type, can be 'item' or 'folder'.
 * @param {string} bookItem.name - The book item name.
 * @param {object[]} bookItems[].items - If the book item type is 'folder', this is a list of book item.
 * @param {string} bookItem.description - If the book item type is 'item', this is the description of the book item.
 * @returns {HTMLLIElement}
 * */
function renderBookItem(path, bookItem) {
  if (bookItem.type === 'folder') return renderBookFolder(path, bookItem);
  const dialogId = slugify(`${path}-${bookItem.name}`);
  const item = createElement('li', {
    classes: 'tormenta20-book-row journalitem dd-item',
  });
  const icon = createElement('div', {
    name: 'tormenta20-chat-info-button',
    classes: 'tormenta20-book-chat-icon',
    onclick: () => {
      setValue(
        '#textchat-input .ui-autocomplete-input',
        `&{template:t20-info}{{infoname=${bookItem.name}}}{{description=${bookItem.description}}}`,
      );
      document.querySelector('#textchat-input .btn').click();
    },
    append: [createElement('a', { classes: 'pictos', innerHTML: 'q' })],
  });
  const title = createElement('div', {
    name: 'tormenta20-dialog-info-button',
    classes: 'tormenta20-book-item-name dd-content',
    innerHTML: bookItem.name,
    onclick: () => {
      const dialogContent =
        bookItem.type === 'item'
          ? bookItem.description
              .split('\n\n')
              .map((line) => createElement('p', { innerHTML: line.trim() }))
          : [generateTableFromTSV(bookItem.content)];
      const dialog = createElement('div', {
        id: dialogId,
        title: bookItem.name,
        append: dialogContent,
      });
      document.body.append(dialog);
      $(dialog).dialog({
        autoOpen: true,
        closeText: '',
        classes: {
          'ui-dialog-titlebar':
            'ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix ui-draggable-handle',
          'ui-dialog-titlebar-close': 'ui-dialog-titlebar-close ui-corner-all',
        },
        close: () => {
          $(dialog).dialog().dialog('destroy');
          dialog.remove();
        },
        ...(bookItem.type === 'item'
          ? { width: 400, height: 200 }
          : { width: 600, height: 400 }),
      });
    },
  });
  if (bookItem.type === 'item') item.append(icon);
  item.append(title);
  return item;
}

/*
 * Generate the book dialog content.
 *
 * @param {object[]} bookItems - List of book item.
 * @param {string} bookItems[].type - The book item type, can be 'item' or 'folder'.
 * @param {string} bookItems[].name - The book item name.
 * @param {object[]} bookItems[].items - If the book item type is 'folder', this is a list of book item.
 * @param {string} bookItems[].description - If the book item type is 'item', this is the description of the book item.
 * @returns {HTMLUListElement}
 * */
function generateBookDialogContent(bookItems) {
  return createElement('ul', {
    id: BOOK_LIST_ID,
    classes: 'dd-list dd folderroot',
    append: bookItems.map((bookItem) => renderBookItem('', bookItem)),
  });
}
