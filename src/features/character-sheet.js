'use strict';

import {
  createElement,
  enhanceElement,
  generateUUID,
  hasCSS,
} from '../common/helpers';
import { EquipmentSheet } from './equipments';
import { PowerSheet } from './powers';
import { RaceSheet } from './races';
import { SpellSheet } from './spells';

/**
 * Create the the CD row element.
 *
 * @returns {HTMLDivElement}
 */
function createCDRow() {
  const content = `
  <span class="spell-cd-item">CD</span>
    <input class="spell-cd-item spell-cd-total" style="margin-right: 5px; border: 2px solid black;" disabled="" value="" maxlength="2" name="spell-cd-total">
    <div class="spell-cd-item">=</div>
    <select class="spell-cd-item spell-cd-bottom-border spell-cd-attr" style="margin-right: 5px" name="spell-cd-attr">
        <option value="int">INT</option>
        <option value="sab">SAB</option>
        <option value="car">CAR</option>
        <option value="for">FOR</option>
        <option value="des">DES</option>
        <option value="con">CON</option>
    </select>
    <div class="spell-cd-item">+</div>
    <input class="spell-cd-item spell-cd-bottom-border spell-cd-extra" maxlength="2" type="text" spellcheck="false" value="0" name="spell-cd-extra">
  `;
  return createElement('div', {
    classes: 'sheet-default-title spell-cd',
    name: 'spell-cd',
    innerHTML: content.trim(),
  });
}

/**
 * Create a new Character Sheet object.
 *
 * @class
 */
export class CharacterSheet {
  /**
   * @constructs
   * @param {Object} props
   * @param {String} props.characterId - The character ID in the Roll20 game.
   * @param {T20Data} props.db - The Tormenta20 data.
   * @param {String} props.characterSheetCssURL - URL for the custom URL to be applied to the character sheet.
   */
  constructor({ characterId, db, characterSheetCssURL }) {
    /** @type {String} */
    this.characterId = characterId;
    /** @type {T20Data} */
    this.db = db;
    /** @type {String} */
    this.characterSheetCssURL = characterSheetCssURL;
    const iframe = document.querySelector(
      `iframe[name="iframe_${characterId}"]`,
    );
    if (!iframe) {
      console.error(`iframe not found for character ID: ${characterId}`);
    }
    /** @type {EnhancedHTMLElement} */
    this.iframe = enhanceElement(iframe.contentDocument);
    /** @type {CharacterData} */
    this.characterData = this.loadCharacterData();
    /** @type {Object} */
    this.roll20 = window.Campaign;
    /** @type {Object} */
    this.character = this.roll20.characters.get(characterId);
    // enhancement
    this.character.getAttributes = (filterFn, transformFn = (a) => a) =>
      this.character.attribs.models
        .filter(filterFn)
        .map(transformFn)
        .reduce((acc, a) => ({ ...acc, [a.get('name')]: a }), {});
    this.character.updateAttributes = (prefix, attributes) => {
      const regex = new RegExp(prefix);
      const attrMap = this.character.getAttributes((a) =>
        regex.test(a.get('name')),
      );
      Object.entries(attributes).forEach(([name, current]) => {
        const attrName = `${prefix}${prefix ? '_' : ''}${name}`;
        const attr = attrMap[attrName];
        if (attr) attr.save({ current });
        else this.character.attribs.create({ name: attrName, current });
      });
    };
    this.character.addAtttributes = (prefix, attributes) => {
      const id = generateUUID().replace(/_/g, 'Z');
      this.character.updateAttributes(`${prefix}_${id}`, attributes);
    };
    this.character.deleteRow = (groupName, rowId) => {
      this.character.view.deleteRepeatingRow(groupName, rowId);
    };

    /** @type {SpellSheet} */
    this.spellSheet = new SpellSheet({
      iframe: this.iframe,
      spells: this.db.spells,
      character: this.character,
    });
    /** @type {PowerSheet} */
    this.powerSheet = new PowerSheet({
      iframe: this.iframe,
      abilitiesAndPowers: this.db.abilities_and_powers,
      character: this.character,
    });
    /** @type {EquipmentSheet} */
    this.equipmentSheet = new EquipmentSheet({
      iframe: this.iframe,
      equipments: this.db.equipments,
      character: this.character,
    });
    /** @type {EquipmentSheet} */
    this.raceSheet = new RaceSheet({
      iframe: this.iframe,
      races: this.db.races,
      character: this.character,
    });
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._isJDA = null;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._spellsContainer = null;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._powersContainer = null;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._equipmentsContainer = null;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._headerContainer = null;
  }

  /** @type {EnhancedHTMLElement|null} */
  get spellsContainer() {
    if (this._spellsContainer === null) {
      const path = 'div.sheet-left-container > div.sheet-spells';
      this._spellsContainer = this.iframe.getElement(path);
    }
    return this._spellsContainer;
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

  /** @type {EnhancedHTMLElement|null} */
  get equipmentsContainer() {
    if (this._equipmentsContainer === null) {
      const path =
        'div.sheet-right-container > div.sheet-equipment-container > div[data-groupname="repeating_equipment"]';
      this._equipmentsContainer = this.iframe.getElement(path);
    }
    return this._equipmentsContainer;
  }

  /** @type {EnhancedHTMLElement|null} */
  get headerContainer() {
    if (this._headerContainer === null) {
      const path = 'div.sheet-left-container > div.sheet-header-info';
      this._headerContainer = this.iframe.getElement(path);
    }
    return this._headerContainer;
  }

  /** @type {Boolean} */
  get isJDA() {
    if (this._isJDA === null) {
      const selector = 'span[data-i18n="global_charactersheet"]';
      this._isJDA = this.iframe.querySelector(selector);
    }
    return Boolean(this._isJDA);
  }

  /** Load the sheet improvements. */
  load() {
    this.observe(this.iframe, ({ observer }) => {
      if (
        this.spellsContainer &&
        this.powersContainer &&
        this.equipmentsContainer &&
        this.headerContainer
      ) {
        if (!this.isJDA) {
          this.init();
          this.calcCD();
        }
        this.spellSheet.load();
        this.powerSheet.load();
        this.equipmentSheet.load();
        this.raceSheet.load();
        // Observers
        this.observe(this.spellsContainer, () => this.spellSheet.load());
        this.observe(this.powersContainer, () => this.powerSheet.load());
        this.observe(this.equipmentsContainer, () =>
          this.equipmentSheet.load(),
        );
        observer.disconnect();
      }
    });
    this.loadCSS();
  }

  /**
   * Adds an observer to the target and executes the callback function every time a new child element is created.
   *
   * @param {HTMLElement} target
   * @param {Function} callbackFn
   */
  observe(target, callbackFn) {
    const observerOptions = {
      attributes: false,
      childList: true,
      subtree: true,
    };
    const observer = new MutationObserver((mutations, observer) => {
      callbackFn({ mutations, observer });
    });
    observer.observe(target, observerOptions);
  }

  /** Init the Cd capabilities. */
  init() {
    if (this.spellsContainer.select`div[name="spell-cd"]`) return; // CD row already added
    // add the row
    this.spellsContainer.select`div.sheet-default-title`.after(createCDRow());
    // add the listeners
    const level = this.iframe.select`input[name="attr_charnivel"]`;
    const attribute = this.spellsContainer.select`select[name="spell-cd-attr"]`;
    const extra = this.spellsContainer.select`input[name="spell-cd-extra"]`;
    attribute.value = this.characterData.attr;
    extra.value = this.characterData.extra;
    attribute.addEventObserver('change', () => {
      if (this.characterData.attr !== attribute.value) {
        this.saveCharacterData({ attr: attribute.value });
        this.calcCD();
      }
    });
    extra.addEventObserver('change', () => {
      if (this.characterData.extra !== extra.value) {
        this.saveCharacterData({ extra: extra.value });
        this.calcCD();
      }
    });
    level.addEventObserver('change', this.calcCD);
    for (const attr of ['for', 'des', 'con', 'int', 'sab', 'car']) {
      this.iframe.select`input[name="attr_${attr}"]`.addEventObserver(
        'change',
        () => {
          setTimeout(this.calcCD, 1000);
        },
      );
    }
  }

  /** Calculate the CD and update CD value. */
  calcCD() {
    const level = this.iframe.getInt('input[name="attr_charnivel"]');
    const attribute = this.spellsContainer.getValue(
      'select[name="spell-cd-attr"]',
    );
    const mod = this.iframe.getInt(`input[name="attr_${attribute}_mod_fake"]`);
    const extra = this.spellsContainer.getInt('input[name="spell-cd-extra"]');
    const value = Math.floor(level / 2) + mod + extra + 10;
    this.spellsContainer.setValue('input[name="spell-cd-total"]', value);
  }

  /**
   * Load the character data to the local storage.
   *
   * @returns {CharacterData}
   */
  loadCharacterData() {
    const defaultData = { attr: 'int', extra: '0' };
    const key = `grimoire_${this.characterId}`;
    const data = localStorage.getItem(key);
    if (!data) return defaultData;
    return { ...defaultData, ...JSON.parse(data) };
  }

  /**
   * Save the character data saved in the local storage.
   *
   * @param {Object} newData
   */
  saveCharacterData(newData) {
    const newCharacterData = { ...this.characterData, ...newData };
    localStorage.setItem(
      `grimoire_${this.characterId}`,
      JSON.stringify(newCharacterData),
    );
    this.characterData = newCharacterData;
  }

  /** Load the extra css in the iframe. */
  loadCSS() {
    if (hasCSS({ iframe: this.iframe, url: this.characterSheetCssURL })) return;
    this.iframe.head.appendChild(
      createElement('link', {
        rel: 'stylesheet',
        href: this.characterSheetCssURL,
      }),
    );
  }
}
