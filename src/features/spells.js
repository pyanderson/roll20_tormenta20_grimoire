'use strict';

import { createElement, enhanceElement } from '../common/helpers';

/**
 * Create the spell dialog element.
 *
 * @param {object} props
 * @param {string} props.circle - The spell circle [1, 2, 3, 4, 5].
 * @param {string[]} props.options - All available spell names for the circle.
 * @returns {HTMLDivElement}
 */
function createSpellDialog({ circle, options }) {
  const content = `
  <form name="spell-form">
    <fieldset>
      <label>
        <b>Nome</b><br>
        <input list="list-${circle}-spells" type="text" name="spell-name" value="" autocomplete="off">
        <datalist id="list-${circle}-spells">
        ${options.map((option) => `<option value="${option}">`).join('')}
         </datalist>
      </label>
      <!-- Allow form submission with keyboard without duplicating the dialog button -->
      <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
    </fieldset>
  </form>
  `;
  return createElement('div', {
    name: 'spell-dialog',
    title: `${circle}º Círculo`,
    innerHTML: content.trim(),
  });
}

/**
 * Create a new Spell Sheet object.
 *
 * @class
 */
export class SpellSheet {
  /**
   * @constructs
   * @param {Object} props
   * @param {EnhancedHTMLElement} props.iframe
   * @param {SpellData} props.spells
   * @param {Object} props.character
   */
  constructor({ iframe, spells, character }) {
    /** @type {EnhancedHTMLElement} */
    this.iframe = iframe;
    /** @type {SpellData} */
    this.spells = spells;
    /** @type {Object} */
    this.character = character;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._spellsContainer = null;
  }

  /** @type {EnhancedHTMLElement|null} */
  get spellsContainer() {
    if (this._spellsContainer === null) {
      const path = 'div.sheet-left-container > div.sheet-spells';
      this._spellsContainer = this.iframe.getElement(path);
    }
    return this._spellsContainer;
  }

  /** Load the sheet spells improvements. */
  load() {
    this.spellsContainer.querySelectorAll('div.repcontainer').forEach((div) => {
      const circle = div.getAttribute('data-groupname').slice(-1);
      div.querySelectorAll('div.sheet-extra').forEach((container) => {
        this.addButton(enhanceElement(container), circle);
      });
    });
  }

  /**
   * Add the button that triggers the creation of the spell selection dialog.
   *
   * @param {EnhancedHTMLElement} container - The repitem div of the spell.
   * @param {string} circle - The spell circle.
   */
  addButton(container, circle) {
    if (container.querySelector('button[name="choose-spell"]')) return; // if the button already exists, ignore
    const repRow = container.parentNode.parentNode;
    const id = repRow.getAttribute('data-reprowid');
    container.prepend(
      createElement('button', {
        classes: 'sheet-singleline',
        name: 'choose-spell',
        innerHTML: 'Escolher Magia',
      }),
    );
    container.prepend(
      createSpellDialog({
        circle,
        options: Object.keys(this.spells[circle] || {}),
      }),
    );
    const button = container.select`button[name="choose-spell"]`;
    const form = container.select`form[name="spell-form"]`;
    const input = form.select`input[name="spell-name"]`;
    // TODO: Use the dialog manager
    const dialog = $(container.select`div[name="spell-dialog"]`).dialog({
      autoOpen: false,
      closeText: '',
      buttons: {
        Confirmar: () => {
          this.update(id, circle, input.value);
          dialog.dialog('close');
        },
        Cancelar: () => dialog.dialog('close'),
      },
    });
    input.addEventObserver('keydown', (e) => {
      if (e.keyCode === 13) {
        this.update(id, circle, input.value);
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
   * @param {Spell} spell
   */
  getAttributes(spell) {
    const spellCD = this.iframe.getValue('input.spell-cd-total');
    return {
      namespell: spell.name,
      spelltipo: spell.type,
      spellexecucao: spell.execution,
      spellalcance: spell.range,
      spellduracao: spell.duration,
      spellalvoarea: spell.target || spell.area || spell.effect,
      spellresistencia: spell.resistance,
      spelldescription: `${spell.description}${
        spell.implements.length > 0 ? '\n\n' : ''
      }${spell.implements
        .map((implement) => `${implement.cost}: ${implement.description}`)
        .join('\n\n')}`,
      // Only adds the spellCD in the old roll20 sheet format.
      ...(spellCD ? { spellcd: spell.resistance !== '' ? spellCD : '' } : {}),
    };
  }

  /**
   * Update the spell data.
   *
   * @param {string} id
   * @param {string} circle - The spell circle.
   * @param {string} name
   */
  async update(id, circle, name) {
    const spell = this.spells[circle][name];
    if (!spell) return;
    const prefix = `repeating_spells${circle}_${id}`;
    const attributes = this.getAttributes(spell);
    this.character.updateAttributes(prefix, attributes);
  }

  /** Add a new spell to the character sheet. */
  addSpell(spell) {
    this.character.addAtttributes(
      `repeating_spells${spell.circle}`,
      this.getAttributes(spell),
    );
  }
}
