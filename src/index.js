'use strict';

import { waitForWindowAttribute } from './common/helpers';
import { loadBook } from './features/book';
import { CharacterSheet } from './features/character-sheet';
import { loadChatEnhancement } from './features/enhancement';

// https://youmightnotneedjquery.com/#ready
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => {
  // As it is necessary to reload the extension several times during development,
  // it is necessary to remove old listners added by previous versions.
  // If this is not done, it will be necessary to refresh the page every time we need to see a change.
  // https://stackoverflow.com/a/63914090
  if (!window.patched) {
    window.listeners = [];
    const orig = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (...args) {
      if (
        args[0] === 'message' &&
        args[1].name === 't20EventListener' &&
        this === window
      ) {
        window.listeners.push(args[1]);
      }
      return orig.apply(this, args);
    };
    window.patched = true;
  }
  window.listeners.forEach((listener) => {
    window.removeEventListener('message', listener, false);
  });
  window.listeners = [];
  const resources = {
    db: {},
    buttonIconURL: '',
    characterSheetCssURL: '',
    characterBuilderCssURL: '',
  };
  const t20EventListener = ({ data }) => {
    if (data?.type && data.type === 't20-data') {
      const {
        db,
        buttonIconURL,
        characterSheetCssURL,
        characterBuilderCssURL,
      } = data;
      loadBook({ bookItems: db.book, buttonIconURL });
      loadChatEnhancement({ bookItems: db.book });
      Object.assign(resources, {
        db,
        buttonIconURL,
        characterSheetCssURL,
        characterBuilderCssURL,
      });
    }
    if (data?.type && data.type === 'loaded') {
      waitForWindowAttribute('Campaign').then(() => {
        const characterSheet = new CharacterSheet({
          db: resources.db,
          characterId: data.characterId,
          characterSheetCssURL: resources.characterSheetCssURL,
          characterBuilderCssURL: resources.characterBuilderCssURL,
        });
        characterSheet.load();
      });
    }
  };
  window.addEventListener('message', t20EventListener, false);
});
