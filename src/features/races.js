'use strict';

import {
  addEventObserver,
  createElement,
  generateUUID,
  pathQuerySelector,
} from '../common/helpers';

/**
 * Add a repeatable item to the character sheet.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {string} props.groupName - The item group name.
 * @param {object[]} props.attributes - The item attributes values.
 * @param {object[]} props.attributes[].name - The input name.
 * @param {object[]} props.attributes[].value - The input value.
 * @returns {HTMLUListElement}
 */
function addRepItem({ iframe, groupName, attributes }) {
  const fieldset = iframe
    .querySelector(`div.repcontrol[data-groupname="${groupName}"]`)
    .parentNode.querySelector('fieldset');
  const itemsContainer = iframe.querySelector(
    `div.repcontainer[data-groupname="${groupName}"]`,
  );
  if (!fieldset) {
    console.error(`fieldset for ${groupName} not found`);
    return;
  }
  const repRowId = generateUUID().replace(/_/g, 'Z');
  const newItem = createElement('div', {
    classes: 'repitem',
    append: [
      createElement('div', {
        classes: 'itemcontrol',
        append: [
          createElement('button', {
            classes: 'btn btn-danger pictos repcontrol_del',
            innerHTML: '#',
          }),
          createElement('a', {
            classes: 'btn repcontrol_move',
            innerHTML: '≡',
          }),
        ],
      }),
      ...Array.from(fieldset.childNodes).map((child) => child.cloneNode(true)),
    ],
  });
  newItem.setAttribute('data-reprowid', repRowId);
  for (const attr of attributes) {
    const attrInput = newItem.querySelector(
      `input[name="${attr.name}"],textarea[name="${attr.name}"]`,
    );
    if (attrInput) {
      attrInput.value = attr.value;
      setTimeout(() => {
        attrInput.dispatchEvent(new CustomEvent('blur'));
      }, 300);
    }
  }
  itemsContainer.append(newItem);
}

/**
 * Add the race autocomplete.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {Race[]} props.races - All available races.
 */
function loadRaceAutoComplete({ iframe, races }) {
  const headerContainer = pathQuerySelector({
    root: iframe,
    path: ['div.sheet-left-container', 'div.sheet-header-info'],
  });
  const abilitiesAndPowersContainer = pathQuerySelector({
    root: iframe,
    path: ['div.sheet-left-container', 'div.sheet-powers-and-abilities'],
  });
  const sizeAndMoveContainer = pathQuerySelector({
    root: iframe,
    path: ['div.sheet-left-container', 'div.sheet-size-and-move-container'],
  });

  if (!headerContainer.querySelector('#race-list')) {
    headerContainer.append(
      createElement('datalist', {
        id: 'race-list',
        append: races.map((race) =>
          createElement('option', { value: race.name }),
        ),
      }),
    );
  }
  const input = headerContainer.querySelector('input[name="attr_trace"]');
  input.setAttribute('list', 'race-list');
  input.autocomplete = 'off';

  const updateAbilities = () => {
    const race = races.find((race) => race.name === input.value);
    if (!race) return;
    const toRemove = races
      .filter((r) => r.name !== race.name)
      .map((r) => r.abilities)
      .reduce(
        (acc, abilities) => [...acc, ...abilities.map((a) => a.name)],
        [],
      );
    const allAbilitiesInputs = () =>
      abilitiesAndPowersContainer.querySelectorAll(
        'input[name="attr_nameability"],input[name="attr_namepower"]',
      );
    const currentAbilities = Array.from(allAbilitiesInputs()).map(
      (abilityInput) => abilityInput.value.trim(),
    );
    // add the race abilities
    for (const ability of race.abilities) {
      if (!currentAbilities.includes(ability.name)) {
        addRepItem({
          iframe,
          groupName: 'repeating_abilities',
          attributes: [
            { name: 'attr_nameability', value: ability.name },
            { name: 'attr_abilitydescription', value: ability.description },
          ],
        });
      }
    }
    // update size and displacement
    if (sizeAndMoveContainer) {
      const sizeSelect = sizeAndMoveContainer.querySelector(
        'select[name="attr_tamanho"]',
      );
      const moveInput = sizeAndMoveContainer.querySelector(
        'input[name="attr_deslocamento"]',
      );
      if (sizeSelect) {
        const size =
          {
            Médio: 0,
            Minúsculo: 5,
            Pequeno: 2,
            Grande: -2,
            Enorme: -5,
            Colossal: -10,
          }[race.size] || 0;
        sizeSelect.value = size;
      }
      if (moveInput) {
        moveInput.value = race.displacement;
      }
    }
    // remove the other races abilities
    setTimeout(() => {
      for (const abilityInput of allAbilitiesInputs()) {
        if (toRemove.includes(abilityInput.value.trim())) {
          abilityInput.parentNode.parentNode
            .querySelector('button.repcontrol_del')
            .click();
        }
      }
    }, 1000);
  };
  addEventObserver({
    el: input,
    eventName: 'input',
    eventHandler: updateAbilities,
  });
  addEventObserver({
    el: input,
    eventName: 'change',
    eventHandler: updateAbilities,
  });
}

/**
 * Load the race related enhancements.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {T20Data} props.data - The Tormenta20 data.
 */
export function loadRacesEnhancement({ iframe, data }) {
  loadRaceAutoComplete({ iframe, races: data.races });
}
