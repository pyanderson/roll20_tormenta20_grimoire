/**
 * @typedef BookItem
 * @type {Object}
 * @property {String} name - The book item name.
 * @property {String} type - The book item type, can be 'item', 'table' or 'folder'.
 * @property {String} description - If the book item type is 'item', this is the description of the book item.
 * @property {String} content - If the book item type is 'table', this is the table content in the TSV format.
 * @property {BookItem[]} items - If the book item type is 'folder', this is a list of book item.
 */

/**
 * @typedef Spell
 * @type {Object}
 * @property {String} area - Eg.: Esfera de 9m de raio
 * @property {String} circle - Eg: 1
 * @property {String} description - Eg.: Você cria uma barreira protetora invisível que detecta qualquer criatura...
 * @property {String} duration - Eg.: cena
 * @property {String} effect - Eg.: domo com 6m de raio
 * @property {String} execution - Eg.: padrão
 * @property {Implement[]} implements
 * @property {String} name - Eg.: Raio Solar
 * @property {String} range - Eg.: médio
 * @property {String} resistance - Eg.: Reflexos
 * @property {String} target - Eg.: 1 criatura
 * @property {String} type - Eg.: Universal 2 (Abjuração)
 */

/**
 * @typedef Implement
 * @type {Object}
 * @property {String} cost - Eg.: +3 PM
 * @property {String} description - Eg.: muda o alvo para “você” e o alcance para “pessoal”.
 */

/**
 * @typedef Power
 * @type {Object}
 * @property {String} name - Eg.: Versátil
 * @property {String} description - Eg.: Você se torna treinado em duas perícias a sua escolha...
 */

/**
 * @typedef Ability
 * @type {Object}
 * @property {String} name - Eg.: Conhecimento das Rochas
 * @property {String} description - Eg.: Você recebe visão no escuro e +2 em testes de Percepção e Sobrevivência realizados no subterrâneo.
 */

/**
 * @typedef T20Data
 * @type {Object}
 * @property {SpellData} spells
 * @property {PowerData} abilities_and_powers
 * @property {EquipmentData[]} equipments
 * @property {Race[]} races
 */

/**
 * @typedef SpellData
 * @type {Object.<(1|2|3|4|5), object.<String, Spell>>}
 */

/**
 * @typedef PowerData
 * @type {Object.<String, Power>}
 */

/**
 * @typedef Weapon
 * @type {Object}
 * @property {String} name - Eg.: Adaga
 * @property {String} price - Eg.: T$ 10
 * @property {String} damage - Eg.: 1d4
 * @property {String} critical - Eg.: 19
 * @property {String} range - Eg.: Curto
 * @property {String} damageType - Eg.: Perfuração
 * @property {String} spaces - Eg.: 1
 * @property {String} proficiency - Eg.: Armas Simples
 * @property {String} purpose - Eg.: Corpo a Corpo
 * @property {String} grip - Eg.: Leve
 */

/**
 * @typedef Armor
 * @type {Object}
 * @property {String} name - Eg.: Loriga segmentada
 * @property {String} price - Eg.: T$ 10
 * @property {String} defenseBonus - Eg.: +7
 * @property {String} armorPenalty - Eg.: -3
 * @property {String} spaces - Eg.: 1
 * @property {String} proficiency - Eg.: Armas Simples
 */

/**
 * @typedef Item
 * @type {Object}
 * @property {String} name - Eg.: Água benta
 * @property {String} price - Eg.: T$ 10
 * @property {String} spaces - Eg.: 1
 * @property {String} category - Eg.: Equipamento de Aventura
 */

/**
 * @typedef Equipment
 * @type {Weapon|Armor|Item}
 */

/**
 * @typedef EquipmentData
 * @type {Object}
 * @property {String} name - Eg.: Armas
 * @property {Weapon[]|Armor[]|Item[]} items
 */

/**
 * @typedef Attribute
 * @type {Object}
 * @property {String} attr - Eg.: con
 * @property {Number} mod - Eg.: 2
 */

/**
 * @typedef Race
 * @type {Object}
 * @property {String} name - Eg.: Anão
 * @property {Number} displacement - Eg.: 6
 * @property {String} size - Eg.: Médio
 * @property {Attribute[]} attributes
 * @property {Ability[]} abilities
 */

/**
 * @class EnhancedHTMLElement
 * @extends HTMLElement
 * @property {String} name - Eg.: Anão
 */

/**
 * @typedef CharacterData
 * @type {Object}
 * @property {String} attr - CD attribute.
 * @property {String} extra - CD bonus.
 */
