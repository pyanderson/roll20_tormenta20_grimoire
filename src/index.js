'use strict';
/* common/constants vars */
/* global DB_PATH */
/* features/character-sheet vars */
/* global loadSheetEnhancement */
/* features/book vars */
/* global loadBook */
/* features/enhancement vars */
/* global loadChatEnhancement */

$(document).ready(() => {
  // Loading all game data in one place to avoid loading this multiple times through the extension.
  fetch(chrome.runtime.getURL(DB_PATH))
    .then((response) => response.json())
    .then((db) => {
      loadBook({ bookItems: db.book });
      loadChatEnhancement({ bookItems: db.book });
      $(window).on('message', (e) => {
        const data = e.originalEvent.data;
        // only add the sheet improvements when a character sheet is opened
        if (data.type === 'loaded')
          loadSheetEnhancement({ db, characterId: data.characterId });
      });
    });
});
