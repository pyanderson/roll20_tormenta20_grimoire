'use strict';

/* common/helpers vars */
/* global pathQuerySelector,createElement */

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
  // const abilitiesAndPowersContainer = pathQuerySelector({
  //   root: iframe,
  //   path: ['div.sheet-left-container', 'div.sheet-powers-and-abilities'],
  // });
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

  // const updateAbilities = () => {
  //   const race = races.find((race) => race.name === input.value);
  //   if (race) {
  //     const toRemove = races
  //       .filter((r) => r.name !== race.name)
  //       .map((r) => r.abilities)
  //       .reduce(
  //         (acc, abilities) => [...acc, ...abilities.map((a) => a.name)],
  //         [],
  //       );
  //     const allAbilitiesInputs = abilitiesAndPowersContainer.querySelectorAll(
  //       'input[name="attr_nameability"],input[name="attr_namepower"]',
  //     );
  //     const currentAbilities = Array.from(allAbilitiesInputs).map(
  //       (abilityInput) => abilityInput.value.trim(),
  //     );
  //     // add the race abilities
  //     for (const ability of race.abilities) {
  //       if (!currentAbilities.includes(ability.name)) {
  //         addRepItem({
  //           iframe,
  //           groupName: 'repeating_abilities',
  //           attributes: [
  //             { name: 'attr_nameability', value: ability.name },
  //             { name: 'attr_abilitydescription', value: ability.description },
  //           ],
  //         });
  //       }
  //     }
  //     // remove the other races abilities
  //     for (const abilityInput of allAbilitiesInputs) {
  //       if (toRemove.includes(abilityInput.value.trim())) {
  //         console.log(`remove ${abilityInput.value}`);
  //       }
  //     }
  //   }
  // };
  // addEventObserver({
  //   el: input,
  //   eventName: 'input',
  //   eventHandler: updateAbilities,
  // });
  // addEventObserver({
  //   el: input,
  //   eventName: 'change',
  //   eventHandler: updateAbilities,
  // });
}

/**
 * Load the race related enhancements.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {T20Data} props.data - The Tormenta20 data.
 */
// eslint-disable-next-line no-unused-vars
function loadRacesEnhancement({ iframe, data }) {
  loadRaceAutoComplete({ iframe, races: data.races });
}
