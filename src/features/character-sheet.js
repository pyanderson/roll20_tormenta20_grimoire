'use strict';

import {
  addEventObserver,
  createElement,
  enhanceElement,
  hasCSS,
  pathQuerySelector,
} from '../common/helpers';
import { loadEquipmentEnhancement } from './equipments';
import { loadPowersEnhancement } from './powers';
import { loadRacesEnhancement } from './races';
import { SpellSheet, calcCD, loadSpellsEnhancement } from './spells';

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
 * Returns the data configuration of the character saved in the local storage.
 *
 * @param {object} props
 * @param {string} props.characterId - The character ID in the Roll20 game.
 * @returns {object}
 */
function loadCharacterData({ characterId }) {
  const defaultData = { attr: 'int', extra: '0' };
  const key = `grimoire_${characterId}`;
  const data = localStorage.getItem(key);
  if (!data) {
    return defaultData;
  }
  return { ...defaultData, ...JSON.parse(data) };
}

/**
 * Save the data configuration of the character in the local storage.
 *
 * @param {object} props
 * @param {string} props.characterId - The character ID in the Roll20 game.
 * @param {object} props.characterData - The character info.
 */
function saveCharacterData({ characterId, characterData }) {
  localStorage.setItem(
    `grimoire_${characterId}`,
    JSON.stringify(characterData),
  );
}

/**
 * Add the CD row in the spells container and add the event listeners.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {string} props.characterId - The character ID in the Roll20 game.
 */
function init({ iframe, characterId }) {
  const spellsContainer = pathQuerySelector({
    root: iframe,
    path: ['div.sheet-left-container', 'div.sheet-spells'],
  });
  if (!spellsContainer) return; // Spells container not rendered yet
  if (spellsContainer.querySelector('div[name="spell-cd"]')) return; // CD row already added
  // add the row
  spellsContainer.querySelector('div.sheet-default-title').after(createCDRow());
  // add the listeners
  const characterData = loadCharacterData({ characterId });
  const level = iframe.querySelector('input[name="attr_charnivel"]');
  const attribute = spellsContainer.querySelector(
    'select[name="spell-cd-attr"]',
  );
  const extra = spellsContainer.querySelector('input[name="spell-cd-extra"]');
  attribute.value = characterData.attr;
  extra.value = characterData.extra;
  addEventObserver({
    el: attribute,
    eventName: 'change',
    eventHandler: () => {
      if (characterData.attr !== attribute.value) {
        characterData.attr = attribute.value;
        saveCharacterData({ characterId, characterData });
        calcCD({ iframe });
      }
    },
  });
  addEventObserver({
    el: extra,
    eventName: 'change',
    eventHandler: () => {
      if (characterData.extra !== extra.value) {
        characterData.extra = extra.value;
        saveCharacterData({ characterId, characterData });
        calcCD({ iframe });
      }
    },
  });
  addEventObserver({
    el: level,
    eventName: 'change',
    eventHandler: () => {
      calcCD({ iframe });
    },
  });
  for (const attr of ['for', 'des', 'con', 'int', 'sab', 'car']) {
    addEventObserver({
      el: iframe.querySelector(`input[name="attr_${attr}"]`),
      eventName: 'change',
      eventHandler: () => {
        setTimeout(() => {
          calcCD({ iframe });
        }, 1000);
      },
    });
  }
}

/**
 * Load the extra css in the iframe.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 */
function loadSheetExtraCSS({ iframe, url }) {
  if (hasCSS({ iframe, url })) return;
  iframe.head.appendChild(
    createElement('link', { rel: 'stylesheet', href: url }),
  );
}

/**
 * Load the sheet improvements.
 *
 * @param {object} props
 * @param {T20Data} props.db - The Tormenta20 data.
 * @param {string} props.characterId - The character ID in the Roll20 game.
 * @param {string} props.characterSheetCssURL - URL for the custom URL to be applied to the character sheet.
 */
export function loadSheetEnhancement({
  db: data,
  characterId,
  characterSheetCssURL,
}) {
  // Load the functionalities
  const iframe = document.querySelector(`iframe[name="iframe_${characterId}"]`);
  if (!iframe) {
    console.error(`iframe not found for character ID: ${characterId}`);
    return;
  }
  const observerOptions = {
    attributes: false,
    childList: true,
    subtree: true,
  };
  // Start the observer
  const observer = new MutationObserver((_, iframeObserver) => {
    const spellsContainer = pathQuerySelector({
      root: iframe.contentDocument,
      path: ['div.sheet-left-container', 'div.sheet-spells'],
    });
    const powersContainer = pathQuerySelector({
      root: iframe.contentDocument,
      path: ['div.sheet-left-container', 'div.sheet-powers-and-abilities'],
    });
    const equipmentsContainer = pathQuerySelector({
      root: iframe.contentDocument,
      path: [
        'div.sheet-right-container',
        'div.sheet-equipment-container',
        'div[data-groupname="repeating_equipment"]',
      ],
    });
    const headerContainer = pathQuerySelector({
      root: iframe.contentDocument,
      path: ['div.sheet-left-container', 'div.sheet-header-info'],
    });
    if (
      spellsContainer &&
      powersContainer &&
      equipmentsContainer &&
      headerContainer
    ) {
      const isJDA = iframe.contentDocument.querySelector(
        'span[data-i18n="global_charactersheet"]',
      );
      if (!isJDA) {
        init({ iframe: iframe.contentDocument, characterId });
        calcCD({ iframe: iframe.contentDocument });
      }
      loadSpellsEnhancement({ iframe: iframe.contentDocument, data });
      loadPowersEnhancement({ iframe: iframe.contentDocument, data });
      loadEquipmentEnhancement({ iframe: iframe.contentDocument, data });
      loadRacesEnhancement({
        iframe: iframe.contentDocument,
        data,
        characterId,
      });
      // Observers
      const spellsObserver = new MutationObserver(() => {
        loadSpellsEnhancement({ iframe: iframe.contentDocument, data });
      });
      const powersObserver = new MutationObserver(() => {
        loadPowersEnhancement({ iframe: iframe.contentDocument, data });
      });
      const equipmentsObserber = new MutationObserver(() => {
        loadEquipmentEnhancement({ iframe: iframe.contentDocument, data });
      });
      spellsObserver.observe(spellsContainer, observerOptions);
      powersObserver.observe(powersContainer, observerOptions);
      equipmentsObserber.observe(equipmentsContainer, observerOptions);
      iframeObserver.disconnect();
    }
  });
  observer.observe(iframe.contentDocument, observerOptions);

  loadSheetExtraCSS({
    iframe: iframe.contentDocument,
    url: characterSheetCssURL,
  });
}

export class CharacterSheet {
  constructor({ characterId, db, characterSheetCssURL }) {
    this.characterId = characterId;
    this.db = db;
    this.characterSheetCssURL = characterSheetCssURL;
    const iframe = document.querySelector(
      `iframe[name="iframe_${characterId}"]`,
    );
    if (!iframe) {
      console.error(`iframe not found for character ID: ${characterId}`);
    }
    this.iframe = enhanceElement(iframe.contentDocument);
    this.roll20 = window.Campaign;
    this.character = this.roll20.characters.get(characterId);
    this.characterData = this.loadCharacterData();
    this._isJDA = null;
    this._spellsContainer = null;
    this._powersContainer = null;
    this._equipmentsContainer = null;
    this._headerContainer = null;
    this.character.getAttributes = (filterFn, transformFn = (a) => a) =>
      this.character.attribs.models
        .filter(filterFn)
        .map(transformFn)
        .reduce((acc, a) => ({ ...acc, [a.get('name')]: a }), {});
    this.spellSheet = new SpellSheet(
      this.iframe,
      this.spellsContainer,
      this.db,
      this.character,
    );
  }

  get spellsContainer() {
    if (this._spellsContainer === null) {
      const path = ['div.sheet-left-container', 'div.sheet-spells'];
      this._spellsContainer = this.iframe.getElement(path);
    }
    return this._spellsContainer;
  }

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

  get abilitiesContainer() {
    return this.powersContainer;
  }

  get equipmentsContainer() {
    if (this._equipmentsContainer === null) {
      const path = [
        'div.sheet-right-container',
        'div.sheet-equipment-container',
        'div[data-groupname="repeating_equipment"]',
      ];
      this._equipmentsContainer = this.iframe.getElement(path);
    }
    return this._equipmentsContainer;
  }

  get headerContainer() {
    if (this._headerContainer === null) {
      const path = ['div.sheet-left-container', 'div.sheet-header-info'];
      this._headerContainer = this.iframe.getElement(path);
    }
    return this._headerContainer;
  }

  get isJDA() {
    if (this._isJDA === null) {
      const selector = 'span[data-i18n="global_charactersheet"]';
      this._isJDA = this.iframe.querySelector(selector);
    }
    return this._isJDA;
  }

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
        this.loadSpells();
        this.loadPowers();
        this.loadEquipment();
        this.loadRaces();
        // Observers
        this.observe(this.spellsContainer, () => this.loadSpells());
        this.observe(this.powersContainer, () => this.loadPowers());
        this.observe(this.equipmentsContainer, () => this.loadEquipment());
        observer.disconnect();
      }
    });
    this.loadCSS();
  }

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

  loadCharacterData() {
    const defaultData = { attr: 'int', extra: '0' };
    const key = `grimoire_${this.characterId}`;
    const data = localStorage.getItem(key);
    if (!data) return defaultData;
    return { ...defaultData, ...JSON.parse(data) };
  }

  saveCharacterData(newData) {
    const newCharacterData = { ...this.characterData, ...newData };
    localStorage.setItem(
      `grimoire_${this.characterId}`,
      JSON.stringify(newCharacterData),
    );
    this.characterData = newCharacterData;
  }

  loadSpells() {
    this.spellSheet.load();
  }

  loadPowers() {
    loadPowersEnhancement({ iframe: this.iframe, data: this.db });
  }

  loadEquipment() {
    loadEquipmentEnhancement({ iframe: this.iframe, data: this.db });
  }

  loadRaces() {
    loadRacesEnhancement({
      iframe: this.iframe,
      data: this.db,
      characterId: this.characterId,
    });
  }

  loadCSS() {
    loadSheetExtraCSS({
      iframe: this.iframe,
      url: this.characterSheetCssURL,
    });
  }
}
