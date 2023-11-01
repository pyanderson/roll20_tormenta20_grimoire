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
 * @typedef Ability
 * @type {object}
 * @property {string} name - Eg.: Conhecimento das Rochas
 * @property {string} description - Eg.: Você recebe visão no escuro e +2 em testes de Percepção e Sobrevivência realizados no subterrâneo.
 */

/**
 * @typedef T20Data
 * @type {object}
 * @property {SpellData} spells
 * @property {PowerData} abilitiesAndPowers
 * @property {EquipmentData[]} equipments
 * @property {Race[]} races
 */

/**
 * @typedef SpellData
 * @type {object.<(1|2|3|4|5), object.<string, Spell>>}
 */

/**
 * @typedef PowerData
 * @type {object.<string, Power>}
 */

/**
 * @typedef Weapon
 * @type {object}
 * @property {string} name - Eg.: Adaga
 * @property {string} price - Eg.: T$ 10
 * @property {string} damage - Eg.: 1d4
 * @property {string} critical - Eg.: 19
 * @property {string} range - Eg.: Curto
 * @property {string} damageType - Eg.: Perfuração
 * @property {string} spaces - Eg.: 1
 * @property {string} proficiency - Eg.: Armas Simples
 * @property {string} purpose - Eg.: Corpo a Corpo
 * @property {string} grip - Eg.: Leve
 */

/**
 * @typedef Armor
 * @type {object}
 * @property {string} name - Eg.: Loriga segmentada
 * @property {string} price - Eg.: T$ 10
 * @property {string} defenseBonus - Eg.: +7
 * @property {string} armorPenalty - Eg.: -3
 * @property {string} spaces - Eg.: 1
 * @property {string} proficiency - Eg.: Armas Simples
 */

/**
 * @typedef Item
 * @type {object}
 * @property {string} name - Eg.: Água benta
 * @property {string} price - Eg.: T$ 10
 * @property {string} spaces - Eg.: 1
 * @property {string} category - Eg.: Equipamento de Aventura
 */

/**
 * @typedef Equipment
 * @type {Weapon|Armor|Item}
 */

/**
 * @typedef EquipmentData
 * @type {object}
 * @property {string} name - Eg.: Armas
 * @property {Weapon[]|Armor[]|Item[]} items
 */

/**
 * @typedef Attribute
 * @type {object}
 * @property {string} attr - Eg.: con
 * @property {number} mod - Eg.: 2
 */

/**
 * @typedef Race
 * @type {object}
 * @property {string} name - Eg.: Anão
 * @property {number} displacement - Eg.: 6
 * @property {Attribute[]} attributes
 * @property {Ability[]} abilities
 */
