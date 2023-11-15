'use strict';

import { createElement, enhanceElement } from '../common/helpers';

/**
 * Create the power dialog element.
 *
 * @param {object} props
 * @param {string[]} props.options - All available powers names.
 * @returns {HTMLDivElement}
 */
function createPowerDialog({ options }) {
  const content = `
  <form name="power-form">
    <fieldset>
      <label>
        <b>Nome</b><br>
        <input list="list-powers" type="text" name="power-name" value="" autocomplete="off">
        <datalist id="list-powers">
        ${options.map((option) => `<option value="${option}">`).join('')}
         </datalist>
      </label>
      <!-- Allow form submission with keyboard without duplicating the dialog button -->
      <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
    </fieldset>
  </form>
  `;
  return createElement('div', {
    name: 'power-dialog',
    title: 'Habilidade ou Poder',
    innerHTML: content.trim(),
  });
}

/**
 * Create a new Power Sheet object.
 *
 * @class
 */
export class PowerSheet {
  /**
   * @constructs
   * @param {Object} props
   * @param {EnhancedHTMLElement} props.iframe
   * @param {PowerData} props.abilitiesAndPowers
   * @param {Object} props.character
   */
  constructor({ iframe, abilitiesAndPowers, character }) {
    /** @type {EnhancedHTMLElement} */
    this.iframe = iframe;
    /** @type {PowerData} */
    this.abilitiesAndPowers = abilitiesAndPowers;
    /** @type {Object} */
    this.character = character;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._powersContainer = null;
  }

  /** @type {EnhancedHTMLElement|null} */
  get powersContainer() {
    if (this._powersContainer === null) {
      const path = 'div.sheet-left-container > div.sheet-powers-and-abilities';
      this._powersContainer = this.iframe.getElement(path);
    }
    return this._powersContainer;
  }

  /** @type {EnhancedHTMLElement|null} */
  get abilitiesContainer() {
    return this.powersContainer;
  }

  /** Load the sheet abilities and powers improvements. */
  load() {
    this.powersContainer.querySelectorAll('div.repcontainer').forEach((div) => {
      div.querySelectorAll('div.sheet-extra').forEach((container) => {
        this.addButton(enhanceElement(container));
      });
    });
  }

  /**
   * Add the button that triggers the creation of the ability/power selection dialog.
   *
   * @param {EnhancedHTMLElement} container - The repitem div of the spell.
   */
  addButton(container) {
    if (container.querySelector('button[name="choose-power"]')) return; // if the button already exists, ignore
    const repRow = container.parentNode.parentNode;
    const repcontainer = repRow.parentNode;
    const id = repRow.getAttribute('data-reprowid');
    const groupName = repcontainer.getAttribute('data-groupname');
    container.prepend(
      createElement('button', {
        classes: 'sheet-singleline',
        name: 'choose-power',
        innerHTML: 'Escolher',
      }),
    );
    container.prepend(
      createPowerDialog({
        options: Object.keys(this.abilitiesAndPowers || {}),
      }),
    );
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    const button = container.select`button[name="choose-power"]`;
    const form = container.select`form[name="power-form"]`;
    const input = form.select`input[name="power-name"]`;
    // TODO: Use the dialog manager
    const dialog = $(container.select`div[name="power-dialog"]`).dialog({
      autoOpen: false,
      closeText: '',
      buttons: {
        Confirmar: () => {
          this.update(groupName, id, input.value);
          dialog.dialog('close');
        },
        Cancelar: () => dialog.dialog('close'),
      },
    });
    input.addEventObserver('keydown', (e) => {
      if (e.keyCode === 13) {
        this.update(groupName, id, input.value);
        dialog.dialog('close');
      }
    });
    button.addEventObserver('click', () => {
      dialog.dialog('open');
      dialog
        .dialog('widget')
        .position({ my: 'center', at: 'center', of: button });
    });
  }

  /**
   * Returns a objects in the format [attribute]: [value].
   *
   * @param {Power} power
   * @returns {Object}
   */
  getPowerAttributes(power) {
    return {
      namepower: power.name,
      powerdescription: power.description,
    };
  }

  /**
   * Returns a objects in the format [attribute]: [value].
   *
   * @param {Ability} ability
   * @returns {Object}
   */
  getAbilityAttributes(ability) {
    return {
      nameability: ability.name,
      abilitydescription: ability.description,
    };
  }

  /**
   * Search for the ability/power object and returns a objects in the format [attribute]: [value].
   *
   * @param {string} name
   */
  getAttributes(groupName, name) {
    const power = this.abilitiesAndPowers[name];
    if (!power) return [];
    if (groupName === 'repeating_powers') return this.getPowerAttributes(power);
    return this.getAbilityAttributes(power);
  }

  /**
   * Update the ability/power data.
   *
   * @param {string} groupName
   * @param {string} id
   * @param {string} name
   */
  async update(groupName, id, name) {
    const attributes = this.getAttributes(groupName, name);
    this.character.updateAttributes(`${groupName}_${id}`, attributes);
  }

  /** Add a new power to the character sheet. */
  addPower(power) {
    this.character.addAttributes(
      'repeating_powers',
      this.getPowerAttributes(power),
    );
  }

  /** Add a new ability to the character sheet. */
  addAbility(ability) {
    this.character.addAttributes(
      'repeating_abilities',
      this.getAbilityAttributes(ability),
    );
  }
}
