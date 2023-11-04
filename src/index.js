'use strict';

import { loadBook } from './features/book';
import { loadSheetEnhancement } from './features/character-sheet';
import { loadChatEnhancement } from './features/enhancement';

const DB_PATH = 'data/db.json';

// https://youmightnotneedjquery.com/#ready
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => {
  // Loading all game data in one place to avoid loading this multiple times through the extension.
  fetch(chrome.runtime.getURL(DB_PATH))
    .then((response) => response.json())
    .then((db) => {
      loadBook({ bookItems: db.book });
      loadChatEnhancement({ bookItems: db.book });
      window.addEventListener(
        'message',
        ({ data }) => {
          // only add the sheet improvements when a character sheet is opened
          if (data.type === 'loaded') {
            loadSheetEnhancement({ db, characterId: data.characterId });
          }
        },
        false,
      );
    });
});
