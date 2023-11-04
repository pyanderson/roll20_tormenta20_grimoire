'use strict';

import {
  addEventObserver,
  createElement,
  pathQuerySelector,
} from '../common/helpers';

/**
 * Add the equipment autocomplete.
 *
 * @param {object} props
 * @param {HTMLElement} props.equipmentsContainer - The equipments container in the right side.
 * @param {Equipment[]} props.equipments - All available equipments.
 */
function loadEquipmentAutoComplete({ equipmentsContainer, equipments }) {
  if (!equipmentsContainer.querySelector('#equipment-list')) {
    equipmentsContainer.append(
      createElement('datalist', {
        id: 'equipment-list',
        append: equipments.map((equipment) =>
          createElement('option', { value: equipment.name }),
        ),
      }),
    );
  }
  for (const input of equipmentsContainer.querySelectorAll(
    'input[name="attr_equipname"]:not([list="equipment-list"])',
  )) {
    input.setAttribute('list', 'equipment-list');
    input.autocomplete = 'off';
    const updateSpacesValue = () => {
      const equipment = equipments.find(
        (equipment) => equipment.name === input.value,
      );
      if (equipment) {
        const value =
          parseFloat(equipment.spaces.replace(',', '.').trim()) || 0;
        const spacesInput = input.parentNode.querySelector(
          'input[name="attr_equipweight"],input[name="attr_equipslot"]',
        );
        spacesInput.focus();
        spacesInput.value = value;
        input.focus();
      }
    };
    addEventObserver({
      el: input,
      eventName: 'input',
      eventHandler: updateSpacesValue,
    });
    addEventObserver({
      el: input,
      eventName: 'change',
      eventHandler: updateSpacesValue,
    });
  }
}

/**
 * Load the equipment related enhancements.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {T20Data} props.data - The Tormenta20 data.
 */
export function loadEquipmentEnhancement({ iframe, data }) {
  const equipmentsContainer = pathQuerySelector({
    root: iframe,
    path: [
      'div.sheet-right-container',
      'div.sheet-equipment-container',
      'div[data-groupname="repeating_equipment"]',
    ],
  });
  loadEquipmentAutoComplete({
    equipmentsContainer,
    equipments: data.equipments.reduce(
      (acc, folder) => [...acc, ...folder.items],
      [],
    ),
  });
}
