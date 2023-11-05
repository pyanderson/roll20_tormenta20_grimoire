'use strict';

import {
  addEventObserver,
  createElement,
  generateUUID,
  pathQuerySelector,
  waitForCondition,
  waitForWindowAttribute,
} from '../common/helpers';

/**
 * Delete a repeatable item of the character sheet.
 *
 * @param {object} props
 * @param {object} props.character - The character in the Roll20 game.
 * @param {object[]} props.attributes - The item attributes values.
 * @param {object[]} props.attributes[].name - The input name.
 * @param {object[]} props.attributes[].value - The input value.
 */
function updateAttributes({ character, attributes }) {
  attributes.forEach(({ name, value }) => {
    const attribute = character.attribs.models.find(
      (attr) => attr.get('name') === name,
    );
    attribute?.save({ name, current: value });
  });
}

/**
 * Delete a repeatable item of the character sheet.
 *
 * @param {object} props
 * @param {object} props.character - The character in the Roll20 game.
 * @param {string} props.groupName - The item group name.
 * @param {string} props.rowId - The data-reprowid value.
 */
function delRepItem({ character, groupName, rowId }) {
  character.view.deleteRepeatingRow(groupName, rowId);
}

/**
 * Add a repeatable item to the character sheet.
 *
 * @param {object} props
 * @param {object} props.character - The character in the Roll20 game.
 * @param {string} props.groupName - The item group name.
 * @param {object[]} props.attributes - The item attributes values.
 * @param {object[]} props.attributes[].name - The input name.
 * @param {object[]} props.attributes[].value - The input value.
 */
function addRepItem({ character, groupName, attributes }) {
  const rowId = generateUUID().replace(/_/g, 'Z');
  attributes.forEach(({ name, value }) => {
    character.attribs.create({
      name: `${groupName}_${rowId}_${name}`,
      current: value,
    });
  });
}

/**
 * Add the race autocomplete.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {Race[]} props.races - All available races.
 * @param {string} props.characterId - The character ID in the Roll20 game.
 */
function loadRaceAutoComplete({ iframe, races, characterId }) {
  const Campaign = window.Campaign;
  const character = Campaign.characters.get(characterId);
  const headerContainer = pathQuerySelector({
    root: iframe,
    path: ['div.sheet-left-container', 'div.sheet-header-info'],
  });
  const abilitiesContainer = pathQuerySelector({
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

  const updateAbilities = async () => {
    const groupName = 'repeating_abilities';
    const race = races.find((race) => race.name === input.value);
    if (!race) return;
    character.attribs.fetch();
    await waitForCondition({
      checkFn: () => character.attribs.models.length > 0,
    });
    const toRemove = races
      .filter((r) => r.name !== race.name)
      .map((r) => r.abilities)
      .reduce(
        (acc, abilities) => [...acc, ...abilities.map((a) => a.name)],
        [],
      );
    const regex =
      /^(repeating_abilities|repeating_powers)_(.+)_(nameability|namepower)$/;
    const currentAttrs = character.attribs.models.filter((x) =>
      regex.test(x.get('name')),
    );
    // add the race abilities
    for (const ability of race.abilities) {
      if (!currentAttrs.find((x) => x.get('current') === race.name)) {
        addRepItem({
          character,
          groupName,
          attributes: [
            { name: 'nameability', value: ability.name },
            { name: 'abilitydescription', value: ability.description },
          ],
        });
      }
    }
    // update size and displacement
    if (sizeAndMoveContainer) {
      const size =
        {
          Médio: 0,
          Minúsculo: 5,
          Pequeno: 2,
          Grande: -2,
          Enorme: -5,
          Colossal: -10,
        }[race.size] || 0;
      updateAttributes({
        character,
        attributes: [
          { name: 'tamanho', value: size },
          { name: 'deslocamento', value: race.displacement },
        ],
      });
    }
    const updatedAttrs = character.attribs.models.filter((x) =>
      regex.test(x.get('name')),
    );
    // remove the other races abilities
    for (const attribute of updatedAttrs) {
      if (toRemove.includes(attribute.get('current').trim())) {
        delRepItem({
          character,
          groupName,
          rowId: attribute.get('id'), // TODO: Fix this ID
        });
      }
    }
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
 * @param {string} props.characterId - The character ID in the Roll20 game.
 */
export function loadRacesEnhancement({ iframe, data, characterId }) {
  waitForWindowAttribute('Campaign').then(() => {
    loadRaceAutoComplete({ iframe, races: data.races, characterId });
  });
}
