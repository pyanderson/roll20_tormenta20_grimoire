'use strict';

import { createElement } from '../common/helpers';

/**
 * Create a new Equipment Sheet object.
 *
 * @class
 */
export class EquipmentSheet {
  /**
   * @constructs
   * @param {Object} props
   * @param {EnhancedHTMLElement} props.iframe
   * @param {EquipmentData[]} props.equipments
   * @param {Object} props.character
   */
  constructor({ iframe, equipments, character }) {
    /** @type {EnhancedHTMLElement} */
    this.iframe = iframe;
    /** @type {EquipmentData[]} */
    this.equipments = equipments;
    /** @type {Equipment[]} */
    this.equipmentsList = equipments.reduce(
      (acc, folder) => [...acc, ...folder.items],
      [],
    );
    /** @type {Object} */
    this.character = character;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._equipmentsContainer = null;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._isJDA = null;
  }

  /** @type {EnhancedHTMLElement|null} */
  get equipmentsContainer() {
    if (this._equipmentsContainer === null) {
      const path =
        'div.sheet-right-container > div.sheet-equipment-container > div[data-groupname="repeating_equipment"]';
      this._equipmentsContainer = this.iframe.getElement(path);
    }
    return this._equipmentsContainer;
  }

  /** @type {Boolean} */
  get isJDA() {
    if (this._isJDA === null) {
      const selector = 'span[data-i18n="global_charactersheet"]';
      this._isJDA = this.iframe.querySelector(selector);
    }
    return Boolean(this._isJDA);
  }

  /** Load the sheet equipment improvements. */
  load() {
    this.loadAutoComplete();
  }

  /** Load the sheet equipment auto complete. */
  loadAutoComplete() {
    if (!this.equipmentsContainer.querySelector('#equipment-list')) {
      this.equipmentsContainer.append(
        createElement('datalist', {
          id: 'equipment-list',
          append: this.equipmentsList.map((equipment) =>
            createElement('option', { value: equipment.name }),
          ),
        }),
      );
    }
    const selector =
      'input[name="attr_equipname"]:not([list="equipment-list"])';
    for (const input of this.equipmentsContainer.getAllElements(selector)) {
      input.setAttribute('list', 'equipment-list');
      input.autocomplete = 'off';
      const repRow = input.parentNode.parentNode;
      const id = repRow.getAttribute('data-reprowid');
      const updateSpacesValue = () => {
        this.update(id, input.value);
      };
      input.addEventObserver('input', updateSpacesValue);
      input.addEventObserver('change', updateSpacesValue);
    }
  }

  /**
   * Returns a objects in the format [attribute]: [value].
   *
   * @param {Equipment} equipment
   * @returns {Object}
   */
  getAttributes(equipment, isUpdate = false) {
    const rawValue = equipment.spaces.replace(',', '.').trim();
    const value = parseFloat(rawValue) || 0;
    return {
      equipname: equipment.name,
      ...(isUpdate ? {} : { equipquantity: '1' }),
      ...(this.isJDA ? { equipslot: value } : { equipweight: value }),
    };
  }

  /**
   * Update the equipment data.
   *
   * @param {string} id
   * @param {string} name
   */
  async update(id, name) {
    const equipment = this.equipmentsList.find(
      (equipment) => equipment.name.toLowerCase() === name.toLowerCase().trim(),
    );
    if (!equipment) return;
    const attributes = this.getAttributes(equipment, true);
    this.character.updateAttributes(`repeating_equipment_${id}`, attributes);
  }

  /** Add a new equipment to the character sheet. */
  addEquipment(equipment) {
    this.character.addAttributes(
      'repeating_equipment',
      this.getAttributes(equipment),
    );
  }
}
