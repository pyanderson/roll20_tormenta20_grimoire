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
        const equipment = this.equipmentsList.find(
          (equipment) => equipment.name === input.value,
        );
        if (equipment) {
          const prefix = `repeating_equipment_${id}`;
          const rawValue = equipment.spaces.replace(',', '.').trim();
          const value = parseFloat(rawValue) || 0;
          const spacesInput = input.parentNode.querySelector(
            'input[name="attr_equipweight"],input[name="attr_equipslot"]',
          );
          const attrName = spacesInput.getAttribute('name').split('_')[1];
          this.character.updateAttributes(prefix, {
            equipname: equipment.name,
            [attrName]: value,
          });
        }
      };
      input.addEventObserver('input', updateSpacesValue);
      input.addEventObserver('change', updateSpacesValue);
    }
  }
}
