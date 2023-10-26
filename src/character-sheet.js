/*
 * Add the CD row in the spells container and add the event listeners.
 *
 * @param {HTMLDocument} iframe - The character sheet iframe document.
 * @param {string} characterId - The character ID in the Roll20 game.
 * */
function init(iframe, characterId, data) {
  const spellsContainer = pathQuerySelector(iframe, [
    'div.sheet-left-container',
    'div.sheet-spells',
  ]);
  const powersContainer = pathQuerySelector(iframe, [
    'div.sheet-left-container',
    'div.sheet-powers-and-abilities',
  ]);
  if (!spellsContainer) return; // Spells container not rendered yet
  if (spellsContainer.querySelector('div[name="spell-cd"]')) return; // CD row already added
  // add the row
  spellsContainer
    .querySelector('div.sheet-default-title')
    .after(generateCDRow());
  // add the listeners
  const characterData = loadCharacterData(characterId);
  const level = iframe.querySelector('input[name="attr_charnivel"]');
  const attribute = spellsContainer.querySelector(
    'select[name="spell-cd-attr"]',
  );
  const extra = spellsContainer.querySelector('input[name="spell-cd-extra"]');
  attribute.value = characterData.attr;
  extra.value = characterData.extra;
  addEventObserver(attribute, 'change', () => {
    if (characterData.attr !== attribute.value) {
      characterData.attr = attribute.value;
      saveCharacterData(characterId, characterData);
      calcCD(iframe);
    }
  });
  addEventObserver(extra, 'change', () => {
    if (characterData.extra !== extra.value) {
      characterData.extra = extra.value;
      saveCharacterData(characterId, characterData);
      calcCD(iframe);
    }
  });
  addEventObserver(level, 'change', () => {
    calcCD(iframe);
  });
  for (const attr of ['for', 'des', 'con', 'int', 'sab', 'car']) {
    addEventObserver(
      iframe.querySelector(`input[name="attr_${attr}"]`),
      'change',
      () => {
        setTimeout(() => {
          calcCD(iframe);
        }, 1000);
      },
    );
  }
}

/*
 * Load the extra css in the iframe.
 *
 * @param {HTMLDocument} iframe - The character sheet iframe document.
 * */
function loadSheetExtraCSS(iframe) {
  const cssURL = chrome.runtime.getURL(CHARACTER_SHEET_CSS_PATH);
  if (hasCSS(iframe, cssURL)) return;
  iframe.head.appendChild(
    createElement('link', { rel: 'stylesheet', href: cssURL }),
  );
}
/*
 * Load the sheet improvements.
 *
 * @param {string} characterId - The character ID in the Roll20 game.
 * */
function loadSheetEnhancement(characterId) {
  // Fetch the Tormenta20 data
  const data = { spells: {}, powers: {}, powersOptions: [] };
  const spellsURL = chrome.runtime.getURL(SPELLS_PATH);
  const powersURL = chrome.runtime.getURL(POWERS_PATH);

  fetch(spellsURL)
    .then((response) => response.json())
    .then((json) => {
      data.spells = json;
    })
    .then(() => {
      fetch(powersURL)
        .then((response) => response.json())
        .then((json) => {
          data.powers = json;
          for (const type of Object.keys(data.powers)) {
            for (const name of Object.keys(data.powers[type])) {
              data.powersOptions.push(`${type} - ${name}`);
            }
          }
        })
        .then(() => {
          // Load the functionalities
          const iframe = document.querySelector(
            `iframe[name="iframe_${characterId}"]`,
          );
          if (!iframe) {
            console.error(`iframe not found for character ID: ${characterId}`);
            return;
          }
          const observer = new MutationObserver(() => {
            const spellsContainer = pathQuerySelector(iframe.contentDocument, [
              'div.sheet-left-container',
              'div.sheet-spells',
            ]);
            if (spellsContainer) {
              init(iframe.contentDocument, characterId, data);
              calcCD(iframe.contentDocument);
              renderSpellsButtons(iframe.contentDocument, data);
              renderPowersButtons(iframe.contentDocument, data);
            }
          });
          observer.observe(iframe.contentDocument, {
            attributes: false,
            childList: true,
            subtree: true,
          });

          loadSheetExtraCSS(iframe.contentDocument);
        });
    });
}
