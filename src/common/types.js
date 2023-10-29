/**
 * @typedef BookItem
 * @type {object}
 * @property {string} name - The book item name.
 * @property {string} type - The book item type, can be 'item', 'table' or 'folder'.
 * @property {string} description - If the book item type is 'item', this is the description of the book item.
 * @property {string} content - If the book item type is 'table', this is the table content in the TSV format.
 * @property {BookItem[]} items - If the book item type is 'folder', this is a list of book item.
 */
