/*
  * Returns the data configuration of the character saved in the local storage.
  *
  * @param {string} characterId - The character ID in the Roll20 game.
  * @returns {object}
  * */
function loadCharacterData (characterId) {
  const defaultData = { attr: 'int', extra: '0' };
  const key = `grimoire_${characterId}`;
  const data = localStorage.getItem(key);
  if (!data) {
    return defaultData;
  }
  return { ...defaultData, ...JSON.parse(data) };
}

/*
  * Save the data configuration of the character in the local storage.
  *
  * @param {string} characterId - The character ID in the Roll20 game.
  * @param {object} characterData - The character info.
  * */
function saveCharacterData (characterId, characterData) {
  localStorage.setItem(`grimoire_${characterId}`, JSON.stringify(characterData));
}

/*
  * Check if a iframe has a css applied.
  *
  * @param {HTMLDocument} iframe - The character sheet iframe document.
  * @param {string} cssURL
  * @returns {boolean}
  * */
function hasCSS (iframe, cssURL) {
  const links = iframe.querySelectorAll('link[rel="stylesheet"]');
  return Boolean(Array.from(links).find(function (link) { return link.href === cssURL; }));
}

/*
  * Calc the CD value.
  *
  * @param {HTMLDocument} iframe - The character sheet iframe document.
  * */
function calcCD (iframe) {
  const spellsContainer = pathQuerySelector(iframe, ['div.sheet-left-container', 'div.sheet-spells']);
  const level = parseInt(iframe.querySelector('input[name="attr_charnivel"]').value) || 0;
  const attribute = spellsContainer.querySelector('select[name="spell-cd-attr"]').value;
  const mod = parseInt(iframe.querySelector(`input[name="attr_${attribute}_mod_fake"]`).value) || 0;
  const extra = parseInt(spellsContainer.querySelector('input[name="spell-cd-extra"]').value) || 0;
  const value = Math.floor(level / 2) + mod + extra + 10;
  spellsContainer.querySelector('input[name="spell-cd-total"]').value = value;
}

/*
  * Fill the a spell container with the spell data.
  *
  * @param {HTMLDocument} iframe - The character sheet iframe document.
  * @param {HTMLDivElement} container - The container to be filled.
  * @param {object} spell - The spell data.
  * */
function fillSpellContainer (iframe, container, spell) {
  if (spell === undefined) return;
  trigger(container.parentNode.querySelector('input[name="attr_namespell"]'), 'focus').value = spell.name;
  trigger(container.querySelector('input[name="attr_spelltipo"]'), 'focus').value = spell.type;
  trigger(container.querySelector('input[name="attr_spellexecucao"]'), 'focus').value = spell.execution;
  trigger(container.querySelector('input[name="attr_spellalcance"]'), 'focus').value = spell.range;
  trigger(container.querySelector('input[name="attr_spellduracao"]'), 'focus').value = spell.duration;
  trigger(container.querySelector('input[name="attr_spellalvoarea"]'), 'focus').value = spell.target || spell.area;
  trigger(container.querySelector('input[name="attr_spellresistencia"]'), 'focus').value = spell.resistance;
  trigger(container.querySelector('textarea[name="attr_spelldescription"]'), 'focus').value = `${spell.description}${spell.implements.length > 0 ? '\n\n' : ''}${spell.implements.map((implement) => `${implement.cost}: ${implement.description}`).join('\n\n')}`;
  if (spell.resistance !== '') {
    trigger(container.querySelector('input[name="attr_spellcd"]'), 'focus').value = iframe.querySelector('input[name="spell-cd-total"]').value;
  } else {
    trigger(container.querySelector('input[name="attr_spellcd"]'), 'focus').value = '';
  }
}

/*
  * Add the button to trigger the spell choose dialog to a spell container.
  *
  * @param {HTMLDocument} iframe - The character sheet iframe document.
  * @param {HTMLDivElement} container - The container to be filled.
  * @param {string} circle - The spell circle.
  * @param {object} data - The Tormenta20 data.
  * */
function renderSpellButton (iframe, container, circle, data) {
  if (container.querySelector('button')) return; // if the button already exists, ignore
  container.prepend(createElement('button', { class: 'sheet-singleline', name: 'choose-spell', innerHTML: 'Escolher Magia' }));
  container.prepend(generateSpellDialog(circle, Object.keys(data.spells[circle] || {})));
  const button = container.querySelector('button[name="choose-spell"]');
  const form = container.querySelector('form[name="spell-form"]');
  const input = form.querySelector('input[name="spell-name"]');
  const dialog = $(container.querySelector('div[name="spell-dialog"]')).dialog({
    autoOpen: false,
    closeText: '',
    buttons: {
      Confirmar: function () {
        fillSpellContainer(iframe, container, data.spells[circle][input.value]);
        dialog.dialog('close');
      },
      Cancelar: function () { dialog.dialog('close'); }
    },
    close: function () {
      form.reset();
    }
  });
  addEventObserver(input, 'keydown', (e) => {
    if (e.keyCode === 13) {
      fillSpellContainer(iframe, container, data.spells[circle][input.value]);
      dialog.dialog('close');
    }
  });
  addEventObserver(button, 'click', () => {
    dialog.dialog('open');
    dialog.dialog('widget').position({ my: 'center', at: 'center', of: button });
  });
}

/*
  * Add the button to trigger the spell choose dialog to all spells containers.
  *
  * @param {HTMLDocument} iframe - The character sheet iframe document.
  * @param {object} data - The Tormenta20 data.
  * */
function renderSpellsButtons (iframe, data) {
  const spellsContainer = pathQuerySelector(iframe, ['div.sheet-left-container', 'div.sheet-spells']);
  for (const parentContainer of spellsContainer.querySelectorAll('div.repcontainer')) {
    const circle = parentContainer.getAttribute('data-groupname').slice(-1);
    for (const container of parentContainer.querySelectorAll('div.sheet-extra')) {
      renderSpellButton(iframe, container, circle, data);
    }
  }
}

/*
  * Add the CD row in the spells container and add the event listeners.
  *
  * @param {HTMLDocument} iframe - The character sheet iframe document.
  * @param {string} characterId - The character ID in the Roll20 game.
  * */
function init (iframe, characterId, data) {
  const spellsContainer = pathQuerySelector(iframe, ['div.sheet-left-container', 'div.sheet-spells']);
  if (!spellsContainer) return; // Spells container not rendered yet
  if (spellsContainer.querySelector('div[name="spell-cd"]')) return; // CD row already added
  // add the row
  spellsContainer.querySelector('div.sheet-default-title').after(generateCDRow());
  // add the listeners
  const characterData = loadCharacterData(characterId);
  const level = iframe.querySelector('input[name="attr_charnivel"]');
  const attribute = spellsContainer.querySelector('select[name="spell-cd-attr"]');
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
  addEventObserver(level, 'change', () => { calcCD(iframe); });
  for (const attr of ['for', 'des', 'con', 'int', 'sab', 'car']) {
    addEventObserver(iframe.querySelector(`input[name="attr_${attr}"]`), 'change', () => {
      setTimeout(function () {
        calcCD(iframe);
      }, 1000);
    });
  }
}

/*
  * Load the extra css in the iframe.
  *
  * @param {HTMLDocument} iframe - The character sheet iframe document.
  * */
function loadSheetExtraCSS (iframe) {
  const cssURL = chrome.runtime.getURL('css/sheet.css');
  if (hasCSS(iframe, cssURL)) return;
  iframe.head.appendChild(createElement('link', { rel: 'stylesheet', href: cssURL }));
}
