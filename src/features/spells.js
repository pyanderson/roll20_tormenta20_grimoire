'use strict';
/* common/constants vars */
/* global  */
/* common/helpers vars */
/* global createElement,addEventObserver,pathQuerySelector,setInputValue */
/* common/element-factory vars */
/* global createSpellDialog */

/**
 * Calc the CD value.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 */
// eslint-disable-next-line no-unused-vars
function calcCD({ iframe }) {
  const spellsContainer = pathQuerySelector({
    root: iframe,
    path: ['div.sheet-left-container', 'div.sheet-spells'],
  });
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

/**
 * Fill the a spell container with the spell data.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {HTMLDivElement} props.container - The container to be filled.
 * @param {Spell} props.spell - The spell data.
 */
function fillSpellContainer({ iframe, container, spell }) {
  if (spell === undefined) return;
  setInputValue({
    selector: 'input[name="attr_namespell"]',
    value: spell.name,
    origin: container.parentNode,
  });
  setInputValue({
    selector: 'input[name="attr_spelltipo"]',
    value: spell.type,
    origin: container,
  });
  setInputValue({
    selector: 'input[name="attr_spellexecucao"]',
    value: spell.execution,
    origin: container,
  });
  setInputValue({
    selector: 'input[name="attr_spellalcance"]',
    value: spell.range,
    origin: container,
  });
  setInputValue({
    selector: 'input[name="attr_spellduracao"]',
    value: spell.duration,
    origin: container,
  });
  setInputValue({
    selector: 'input[name="attr_spellalvoarea"]',
    value: spell.target || spell.area || spell.effect,
    origin: container,
  });
  setInputValue({
    selector: 'input[name="attr_spellresistencia"]',
    value: spell.resistance,
    origin: container,
  });
  setInputValue({
    selector: 'textarea[name="attr_spelldescription"]',
    value: `${spell.description}${
      spell.implements.length > 0 ? '\n\n' : ''
    }${spell.implements
      .map((implement) => `${implement.cost}: ${implement.description}`)
      .join('\n\n')}`,
    origin: container,
  });

  if (spell.resistance !== '') {
    setInputValue({
      selector: 'input[name="attr_spellcd"]',
      value: iframe.querySelector('input[name="spell-cd-total"]').value,
      origin: container,
    });
  } else {
    setInputValue({
      selector: 'input[name="attr_spellcd"]',
      value: '',
      origin: container,
    });
  }
}

/**
 * Add the button to trigger the spell choose dialog to a spell container.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {HTMLDivElement} props.container - The container to be filled.
 * @param {string} props.circle - The spell circle.
 * @param {T20Data} props.data - The Tormenta20 data.
 */
function renderSpellButton({ iframe, container, circle, data }) {
  if (container.querySelector('button[name="choose-spell"]')) return; // if the button already exists, ignore
  container.prepend(
    createElement('button', {
      classes: 'sheet-singleline',
      name: 'choose-spell',
      innerHTML: 'Escolher Magia',
    }),
  );
  container.prepend(
    createSpellDialog({
      circle,
      options: Object.keys(data.spells[circle] || {}),
    }),
  );
  const button = container.querySelector('button[name="choose-spell"]');
  const form = container.querySelector('form[name="spell-form"]');
  const input = form.querySelector('input[name="spell-name"]');
  // TODO: Use the dialog manager
  const dialog = $(container.querySelector('div[name="spell-dialog"]')).dialog({
    autoOpen: false,
    closeText: '',
    buttons: {
      Confirmar: () => {
        fillSpellContainer({
          iframe,
          container,
          spell: data.spells[circle][input.value],
        });
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
  addEventObserver({
    el: input,
    eventName: 'keydown',
    eventHandler: (e) => {
      if (e.keyCode === 13) {
        fillSpellContainer({
          iframe,
          container,
          spell: data.spells[circle][input.value],
        });
        dialog.dialog('close');
      }
    },
  });
  addEventObserver({
    el: button,
    eventName: 'click',
    eventHandler: () => {
      dialog.dialog('open');
      dialog
        .dialog('widget')
        .position({ my: 'center', at: 'center', of: button });
    },
  });
}

/**
 * Add the button to trigger the spell choose dialog to all spells containers.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {T20Data} props.data - The Tormenta20 data.
 */
// eslint-disable-next-line no-unused-vars
function loadSpellsEnhancement({ iframe, data }) {
  const spellsContainer = pathQuerySelector({
    root: iframe,
    path: ['div.sheet-left-container', 'div.sheet-spells'],
  });
  for (const parentContainer of spellsContainer.querySelectorAll(
    'div.repcontainer',
  )) {
    const circle = parentContainer.getAttribute('data-groupname').slice(-1);
    for (const container of parentContainer.querySelectorAll(
      'div.sheet-extra',
    )) {
      renderSpellButton({ iframe, container, circle, data });
    }
  }
}
