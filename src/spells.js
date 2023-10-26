/*
 * Returns the data configuration of the character saved in the local storage.
 *
 * @param {string} characterId - The character ID in the Roll20 game.
 * @returns {object}
 * */
function loadCharacterData(characterId) {
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
function saveCharacterData(characterId, characterData) {
  localStorage.setItem(
    `grimoire_${characterId}`,
    JSON.stringify(characterData),
  );
}

/*
 * Check if a iframe has a css applied.
 *
 * @param {HTMLDocument} iframe - The character sheet iframe document.
 * @param {string} cssURL
 * @returns {boolean}
 * */
function hasCSS(iframe, cssURL) {
  const links = iframe.querySelectorAll('link[rel="stylesheet"]');
  return Boolean(
    Array.from(links).find((link) => {
      return link.href === cssURL;
    }),
  );
}

/*
 * Calc the CD value.
 *
 * @param {HTMLDocument} iframe - The character sheet iframe document.
 * */
function calcCD(iframe) {
  const spellsContainer = pathQuerySelector(iframe, [
    'div.sheet-left-container',
    'div.sheet-spells',
  ]);
  const level =
    parseInt(iframe.querySelector('input[name="attr_charnivel"]').value) || 0;
  const attribute = spellsContainer.querySelector(
    'select[name="spell-cd-attr"]',
  ).value;
  const mod =
    parseInt(
      iframe.querySelector(`input[name="attr_${attribute}_mod_fake"]`).value,
    ) || 0;
  const extra =
    parseInt(
      spellsContainer.querySelector('input[name="spell-cd-extra"]').value,
    ) || 0;
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
function fillSpellContainer(iframe, container, spell) {
  if (spell === undefined) return;
  setValue('input[name="attr_namespell"]', spell.name, container.parentNode);
  setValue('input[name="attr_spelltipo"]', spell.type, container);
  setValue('input[name="attr_spellexecucao"]', spell.execution, container);
  setValue('input[name="attr_spellalcance"]', spell.range, container);
  setValue('input[name="attr_spellduracao"]', spell.duration, container);
  setValue(
    'input[name="attr_spellalvoarea"]',
    spell.target || spell.area,
    container,
  );
  setValue('input[name="attr_spellresistencia"]', spell.resistance, container);
  setValue(
    'textarea[name="attr_spelldescription"]',
    `${spell.description}${
      spell.implements.length > 0 ? '\n\n' : ''
    }${spell.implements
      .map((implement) => `${implement.cost}: ${implement.description}`)
      .join('\n\n')}`,
    container,
  );

  if (spell.resistance !== '') {
    setValue(
      'input[name="attr_spellcd"]',
      iframe.querySelector('input[name="spell-cd-total"]').value,
      container,
    );
  } else {
    setValue('input[name="attr_spellcd"]', '', container);
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
function renderSpellButton(iframe, container, circle, data) {
  if (container.querySelector('button[name="choose-spell"]')) return; // if the button already exists, ignore
  container.prepend(
    createElement('button', {
      classes: 'sheet-singleline',
      name: 'choose-spell',
      innerHTML: 'Escolher Magia',
    }),
  );
  container.prepend(
    generateSpellDialog(circle, Object.keys(data.spells[circle] || {})),
  );
  const button = container.querySelector('button[name="choose-spell"]');
  const form = container.querySelector('form[name="spell-form"]');
  const input = form.querySelector('input[name="spell-name"]');
  const dialog = $(container.querySelector('div[name="spell-dialog"]')).dialog({
    autoOpen: false,
    closeText: '',
    buttons: {
      Confirmar: () => {
        fillSpellContainer(iframe, container, data.spells[circle][input.value]);
        dialog.dialog('close');
      },
      Cancelar: () => {
        dialog.dialog('close');
      },
    },
    close: () => {
      form.reset();
    },
  });
  addEventObserver(input, 'keydown', (e) => {
    if (e.keyCode === 13) {
      fillSpellContainer(iframe, container, data.spells[circle][input.value]);
      dialog.dialog('close');
    }
  });
  addEventObserver(button, 'click', () => {
    dialog.dialog('open');
    dialog
      .dialog('widget')
      .position({ my: 'center', at: 'center', of: button });
  });
}

/*
 * Add the button to trigger the spell choose dialog to all spells containers.
 *
 * @param {HTMLDocument} iframe - The character sheet iframe document.
 * @param {object} data - The Tormenta20 data.
 * */
function renderSpellsButtons(iframe, data) {
  const spellsContainer = pathQuerySelector(iframe, [
    'div.sheet-left-container',
    'div.sheet-spells',
  ]);
  for (const parentContainer of spellsContainer.querySelectorAll(
    'div.repcontainer',
  )) {
    const circle = parentContainer.getAttribute('data-groupname').slice(-1);
    for (const container of parentContainer.querySelectorAll(
      'div.sheet-extra',
    )) {
      renderSpellButton(iframe, container, circle, data);
    }
  }
}
