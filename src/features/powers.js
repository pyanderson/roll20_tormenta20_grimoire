'use strict';

import {
  addEventObserver,
  createElement,
  enhanceElement,
  pathQuerySelector,
  setInputValue,
  waitForCondition,
} from '../common/helpers';

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
 * Fill the a power container with the power data.
 *
 * @param {object} props
 * @param {HTMLDivElement} props.container - The container to be filled.
 * @param {Power} props.power - The Tormenta20 data.
 */
function fillPowerContainer({ container, power }) {
  if (power === undefined) return;
  setInputValue({
    selector: 'input[name="attr_nameability"],input[name="attr_namepower"]',
    value: power.name,
    origin: container.parentNode,
  });
  setInputValue({
    selector:
      'textarea[name="attr_abilitydescription"],textarea[name="attr_powerdescription"]',
    value: power.description,
    origin: container,
  });
}

/**
 * Add the button to trigger the power choose dialog to a power container.
 *
 * @param {object} props
 * @param {HTMLDivElement} props.container - The container to be filled.
 * @param {T20Data} props.data - The Tormenta20 data.
 */
function renderPowerButton({ container, data }) {
  if (container.querySelector('button[name="choose-power"]')) return; // if the button already exists, ignore
  container.prepend(
    createElement('button', {
      classes: 'sheet-singleline',
      name: 'choose-power',
      innerHTML: 'Escolher',
    }),
  );
  container.prepend(
    createPowerDialog({
      options: Object.keys(data?.abilities_and_powers || {}),
    }),
  );
  container.style.flexDirection = 'column';
  container.style.gap = '8px';
  const button = container.querySelector('button[name="choose-power"]');
  const form = container.querySelector('form[name="power-form"]');
  const input = form.querySelector('input[name="power-name"]');
  // TODO: Use the dialog manager
  const dialog = $(container.querySelector('div[name="power-dialog"]')).dialog({
    autoOpen: false,
    closeText: '',
    buttons: {
      Confirmar: () => {
        fillPowerContainer({
          container,
          power: data.abilities_and_powers[input.value],
        });
        dialog.dialog('close');
      },
      Cancelar: () => {
        dialog.dialog('close');
      },
    },
    close: () => {
      form.reset();
    },
  });
  addEventObserver({
    el: input,
    eventName: 'keydown',
    eventHandler: (e) => {
      if (e.keyCode === 13) {
        fillPowerContainer({
          container,
          power: data.abilities_and_powers[input.value],
        });
        dialog.dialog('close');
      }
    },
  });
  addEventObserver({
    el: button,
    eventName: 'click',
    eventHandler: () => {
      dialog.dialog('open');
      dialog
        .dialog('widget')
        .position({ my: 'center', at: 'center', of: button });
    },
  });
}

/**
 * Add the button to trigger the power choose dialog to all powers containers.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {T20Data} props.data - The Tormenta20 data.
 */
export function loadPowersEnhancement({ iframe, data }) {
  const powersContainer = pathQuerySelector({
    root: iframe,
    path: ['div.sheet-left-container', 'div.sheet-powers-and-abilities'],
  });
  for (const parentContainer of powersContainer.querySelectorAll(
    'div.repcontainer',
  )) {
    for (const container of parentContainer.querySelectorAll(
      'div.sheet-extra',
    )) {
      renderPowerButton({ container, data });
    }
  }
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
    // enhancement
    this.character.updateAbilityPower = (groupName, id, name) => {
      const attributes = this.getAttributes(groupName, name);
      this.character.updateAttributes(`${groupName}_${id}`, attributes);
    };
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._powersContainer = null;
  }

  /** @type {EnhancedHTMLElement|null} */
  get powersContainer() {
    if (this._powersContainer === null) {
      const path = [
        'div.sheet-left-container',
        'div.sheet-powers-and-abilities',
      ];
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
          this.update(container, input.value);
          dialog.dialog('close');
        },
        Cancelar: () => dialog.dialog('close'),
      },
    });
    input.addEventObserver('keydown', (e) => {
      if (e.keyCode === 13) {
        this.update(container, input.value);
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
   * Search for the ability/power object and returns a objects in the format [attribute]: [value].
   *
   * @param {string} name
   */
  getAttributes(groupName, name) {
    const power = this.abilitiesAndPowers[name];
    if (!power) return [];
    if (groupName === 'repeating_powers') {
      return {
        namepower: power.name,
        powerdescription: power.description,
      };
    }
    return {
      nameability: power.name,
      abilitydescription: power.description,
    };
  }

  /**
   * Update the ability/power data.
   *
   * @param {EnhancedHTMLElement} container - The repitem div of the spell.
   * @param {string} name
   */
  async update(container, name) {
    this.character.attribs.fetch();
    await waitForCondition({
      checkFn: () => this.character.attribs.models.length > 0,
    });
    const repRow = container.parentNode.parentNode;
    const repcontainer = repRow.parentNode;
    const id = repRow.getAttribute('data-reprowid');
    const groupName = repcontainer.getAttribute('data-groupname');
    this.character.updateAbilityPower(groupName, id, name);
  }
}
