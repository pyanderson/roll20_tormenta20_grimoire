'use strict';

import {
  addEventObserver,
  createElement,
  hasCSS,
  pathQuerySelector,
} from '../common/helpers';
import { loadEquipmentEnhancement } from './equipments';
import { loadPowersEnhancement } from './powers';
import { loadRacesEnhancement } from './races';
import { calcCD, loadSpellsEnhancement } from './spells';

const CHARACTER_SHEET_CSS_PATH = 'src/css/sheet.css';

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
function loadSheetExtraCSS({ iframe }) {
  const url = chrome.runtime.getURL(CHARACTER_SHEET_CSS_PATH);
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
 */
export function loadSheetEnhancement({ db: data, characterId }) {
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
      loadRacesEnhancement({ iframe: iframe.contentDocument, data });
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

  loadSheetExtraCSS({ iframe: iframe.contentDocument });
}
