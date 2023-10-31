'use strict';
/* common/constants vars */
/* global CHARACTER_SHEET_CSS_PATH */
/* common/helpers vars */
/* global createElement,addEventObserver,pathQuerySelector,hasCSS */
/* common/element-factory vars */
/* global createCDRow */
/* features/powers vars  */
/* global renderPowersButtons */
/* features/spells vars */
/* global calcCD,renderSpellsButtons */

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
 * @param {SpellData} props.spells - The spells data.
 * @param {PowerData} props.powers - The powers data.
 * @param {string} props.characterId - The character ID in the Roll20 game.
 */
// eslint-disable-next-line no-unused-vars
function loadSheetEnhancement({ spells, abilitiesAndPowers, characterId }) {
  // Fetch the Tormenta20 data
  const data = { spells, abilitiesAndPowers };
  // Load the functionalities
  const iframe = document.querySelector(`iframe[name="iframe_${characterId}"]`);
  if (!iframe) {
    console.error(`iframe not found for character ID: ${characterId}`);
    return;
  }
  // Start the observer
  const observer = new MutationObserver(() => {
    const spellsContainer = pathQuerySelector({
      root: iframe.contentDocument,
      path: ['div.sheet-left-container', 'div.sheet-spells'],
    });
    if (spellsContainer) {
      init({ iframe: iframe.contentDocument, characterId });
      calcCD({ iframe: iframe.contentDocument });
      renderSpellsButtons({ iframe: iframe.contentDocument, data });
      renderPowersButtons({ iframe: iframe.contentDocument, data });
    }
  });
  observer.observe(iframe.contentDocument, {
    attributes: false,
    childList: true,
    subtree: true,
  });

  loadSheetExtraCSS({ iframe: iframe.contentDocument });
}
