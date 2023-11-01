'use strict';

/* common/helpers vars */
/* global pathQuerySelector,createElement,addEventObserver */

/**
 * Add the equipment autocomplete.
 *
 * @param {object} props
 * @param {HTMLElement} props.equipmentsContainer - The equipments container in the right side.
 * @param {Equipment[]} props.equipments - All available equipments.
 */
function loadEquipmentAutoComplete({ equipmentsContainer, equipments }) {
  if (!equipmentsContainer.querySelector('#list-equipment')) {
    equipmentsContainer.append(
      createElement('datalist', {
        id: 'list-equipment',
        append: equipments.map((equipment) =>
          createElement('option', { value: equipment.name }),
        ),
      }),
    );
  }
  for (const input of equipmentsContainer.querySelectorAll(
    'input[name="attr_equipname"]:not([list="list-equipment"])',
  )) {
    input.setAttribute('list', 'list-equipment');
    input.autocomplete = 'off';
    const updateSpacesValue = () => {
      const equipment = equipments.find(
        (equipment) => equipment.name === input.value,
      );
      if (equipment) {
        const value =
          parseFloat(equipment.spaces.replace(',', '.').trim()) || 0;
        const spacesInput = input.parentNode.querySelector(
          'input[name="attr_equipweight"]',
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
 * Add the equipment autocomplete.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {T20Data} props.data - The Tormenta20 data.
 */
// eslint-disable-next-line no-unused-vars
function loadEquipmentEnhancement({ iframe, data }) {
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
