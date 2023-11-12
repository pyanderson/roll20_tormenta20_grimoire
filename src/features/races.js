'use strict';

import { createElement, waitForCondition } from '../common/helpers';

/**
 * Create a new Race Sheet object.
 *
 * @class
 */
export class RaceSheet {
  /**
   * @constructs
   * @param {Object} props
   * @param {EnhancedHTMLElement} props.iframe
   * @param {Race[]} props.races
   * @param {Object} props.character
   */
  constructor({ iframe, races, character }) {
    /** @type {EnhancedHTMLElement} */
    this.iframe = iframe;
    /** @type {EquipmentData[]} */
    this.races = races;
    /** @type {Object} */
    this.character = character;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._headerContainer = null;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._sizeAndMoveContainer = null;
  }

  /** @type {EnhancedHTMLElement|null} */
  get headerContainer() {
    if (this._headerContainer === null) {
      const path = 'div.sheet-left-container > div.sheet-header-info';
      this._headerContainer = this.iframe.getElement(path);
    }
    return this._headerContainer;
  }

  /** @type {EnhancedHTMLElement|null} */
  get sizeAndMoveContainer() {
    if (this._sizeAndMoveContainer === null) {
      const path =
        'div.sheet-left-container > div.sheet-size-and-move-container';
      this._sizeAndMoveContainer = this.iframe.getElement(path);
    }
    return this._sizeAndMoveContainer;
  }

  /** Load the sheet race improvements. */
  load() {
    this.loadAutoComplete();
  }

  /** Load the sheet race auto complete. */
  loadAutoComplete() {
    if (!this.headerContainer.querySelector('#race-list')) {
      this.headerContainer.append(
        createElement('datalist', {
          id: 'race-list',
          append: this.races.map((race) =>
            createElement('option', { value: race.name }),
          ),
        }),
      );
    }
    const input = this.headerContainer.select`input[name="attr_trace"]`;
    input.setAttribute('list', 'race-list');
    input.autocomplete = 'off';

    const updateAbilities = async () => {
      const race = this.races.find((race) => race.name === input.value);
      if (!race) return;
      this.character.attribs.fetch();
      await waitForCondition({
        checkFn: () => this.character.attribs.models.length > 0,
      });
      const toAdd = race.abilities.reduce((acc, a) => [...acc, a.name], []);
      const toRemove = this.races
        .filter((r) => r.name !== race.name)
        .map((r) => r.abilities)
        .reduce(
          (acc, abilities) => [
            ...acc,
            ...abilities
              .filter((a) => toAdd.indexOf(a.name) === -1)
              .map((a) => a.name),
          ],
          [],
        );
      const regex =
        /^(?<groupName>repeating_abilities|repeating_powers)_(?<id>-.+)_(nameability|namepower)$/;

      const allAttributesMap = this.character.getAttributes(
        (a) => regex.test(a.get('name')),
        (a) => {
          const match = a.get('name').match(regex);
          a.rowId = match?.groups.id;
          a.groupName = match?.groups.groupName;
          return a;
        },
      );

      const allAttributes = Object.values(allAttributesMap);

      // add the race abilities
      for (const ability of race.abilities) {
        if (!allAttributes.find((a) => a.get('current') === race.name)) {
          this.character.addAtttributes('repeating_abilities', {
            nameability: ability.name,
            abilitydescription: ability.description,
          });
        }
      }
      // update size and displacement
      if (this.sizeAndMoveContainer) {
        const size =
          {
            Médio: 0,
            Minúsculo: 5,
            Pequeno: 2,
            Grande: -2,
            Enorme: -5,
            Colossal: -10,
          }[race.size] || 0;
        this.character.updateAttributes('', {
          tamanho: size,
          deslocamento: race.displacement,
        });
      }
      // remove the other races abilities
      for (const attribute of allAttributes) {
        if (toRemove.includes(attribute.get('current').trim())) {
          this.character.deleteRow(attribute.groupName, attribute.rowId);
        }
      }
    };
    input.addEventObserver('change', updateAbilities);
  }
}
