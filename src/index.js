'use strict';
/* common/constants vars */
/* global BOOK_PATH,SPELLS_PATH,POWERS_PATH,TABLES_PATH */
/* features/character-sheet vars */
/* global loadSheetEnhancement */
/* features/book vars */
/* global loadBook */
/* features/enhancement vars */
/* global loadChatEnhancement */

$(document).ready(() => {
  // Loading all game data in one place to avoid loading this multiple times through the extension.
  const t20Data = { book: [], spells: {}, powers: {}, tables: {} };
  const promisses = [
    [BOOK_PATH, 'book'],
    [SPELLS_PATH, 'spells'],
    [POWERS_PATH, 'powers'],
    [TABLES_PATH, 'tables'],
  ].map(([path, key]) =>
    fetch(chrome.runtime.getURL(path))
      .then((response) => response.json())
      .then((data) => {
        t20Data[key] = data;
      }),
  );

  $(window).on('message', (e) => {
    const data = e.originalEvent.data;
    // only add the sheet improvements when a character sheet is opened
    if (data.type === 'loaded')
      loadSheetEnhancement({
        spells: t20Data.spells,
        powers: t20Data.powers,
        characterId: data.characterId,
      });
  });

  Promise.all(promisses).then(() => {
    loadBook({ bookItems: [...t20Data.book, t20Data.tables] });
    loadChatEnhancement({ bookItems: t20Data.book });
  });
});
