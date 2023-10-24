/*
  * Load the sheet improvements.
  *
  * @param {string} characterId - The character ID in the Roll20 game.
  * */
function loadSheetEnhancement (characterId) {
  // Fetch the Tormenta20 data
  const data = { spells: {}, powers: {}, powersOptions: [] };
  const spellsURL = chrome.runtime.getURL('data/spells.json');
  const powersURL = chrome.runtime.getURL('data/powers.json');

  fetch(spellsURL)
    .then((response) => response.json())
    .then((json) => { data.spells = json; }).then(() => {
      fetch(powersURL)
        .then((response) => response.json())
        .then((json) => {
          data.powers = json;
          for (const type of Object.keys(data.powers)) {
            for (const name of Object.keys(data.powers[type])) {
              data.powersOptions.push(`${type} - ${name}`);
            }
          }
        }).then(() => {
          // Load the functionalities
          const iframe = document.querySelector(`iframe[name="iframe_${characterId}"]`);
          if (!iframe) {
            console.error(`iframe not found for character ID: ${characterId}`);
            return;
          }
          const observer = new MutationObserver(function () {
            const spellsContainer = pathQuerySelector(iframe.contentDocument, ['div.sheet-left-container', 'div.sheet-spells']);
            if (spellsContainer) {
              init(iframe.contentDocument, characterId, data);
              calcCD(iframe.contentDocument);
              renderSpellsButtons(iframe.contentDocument, data);
              renderPowersButtons(iframe.contentDocument, data);
            }
          });
          observer.observe(iframe.contentDocument, { attributes: false, childList: true, subtree: true });

          loadSheetExtraCSS(iframe.contentDocument);
        });
    });
}
