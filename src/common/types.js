/**
 * @typedef BookItem
 * @type {object}
 * @property {string} name - The book item name.
 * @property {string} type - The book item type, can be 'item', 'table' or 'folder'.
 * @property {string} description - If the book item type is 'item', this is the description of the book item.
 * @property {string} content - If the book item type is 'table', this is the table content in the TSV format.
 * @property {BookItem[]} items - If the book item type is 'folder', this is a list of book item.
 */

/**
 * @typedef Spell
 * @type {object}
 * @property {string} area - Eg.: Esfera de 9m de raio
 * @property {string} circle - Eg: 1
 * @property {string} description - Eg.: Você cria uma barreira protetora invisível que detecta qualquer criatura...
 * @property {string} duration - Eg.: cena
 * @property {string} effect - Eg.: domo com 6m de raio
 * @property {string} execution - Eg.: padrão
 * @property {Implement[]} implements
 * @property {string} name - Eg.: Raio Solar
 * @property {string} range - Eg.: médio
 * @property {string} resistance - Eg.: Reflexos
 * @property {string} target - Eg.: 1 criatura
 * @property {string} type - Eg.: Universal 2 (Abjuração)
 */

/**
 * @typedef Implement
 * @type {object}
 * @property {string} cost - Eg.: +3 PM
 * @property {string} description - Eg.: muda o alvo para “você” e o alcance para “pessoal”.
 */

/**
 * @typedef Power
 * @type {object}
 * @property {string} name - Eg.: Versátil
 * @property {string} description - Eg.: Você se torna treinado em duas perícias a sua escolha...
 */

/**
 * @typedef T20Data
 * @type {object}
 * @property {SpellData} spells
 * @property {PowerData} abilitiesAndPowers
 */

/**
 * @typedef SpellData
 * @type {object.<(1|2|3|4|5), object.<string, Spell>>}
 */

/**
 * @typedef PowerData
 * @type {object.<string, Power>}
 */
