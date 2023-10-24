/*
  * Fill the a power container with the power data.
  *
  * @param {HTMLDivElement} container - The container to be filled.
  * @param {object} data - The Tormenta20 data.
  * */
function fillPowerContainer (container, power) {
  if (power === undefined) return;
  trigger(container.parentNode.querySelector('input[name="attr_namepower"]'), 'focus').value = power.name;
  trigger(container.querySelector('textarea[name="attr_powerdescription"]'), 'focus').value = power.description;
}

/*
  * Add the button to trigger the power choose dialog to a power container.
  *
  * @param {HTMLDivElement} container - The container to be filled.
  * @param {object} data - The Tormenta20 data.
  * */
function renderPowerButton (container, data) {
  if (container.querySelector('button[name="choose-power"]')) return; // if the button already exists, ignore
  container.prepend(createElement('button', { class: 'sheet-singleline', name: 'choose-power', innerHTML: 'Escolher' }));
  container.prepend(generatePowerDialog(data.powersOptions));
  container.style.flexDirection = 'column';
  container.style.gap = '8px';
  const button = container.querySelector('button[name="choose-power"]');
  const form = container.querySelector('form[name="power-form"]');
  const input = form.querySelector('input[name="power-name"]');
  const dialog = $(container.querySelector('div[name="power-dialog"]')).dialog({
    autoOpen: false,
    closeText: '',
    buttons: {
      Confirmar: function () {
        const items = input.value.split(' - ');
        if (items.length <= 1) return false;
        fillPowerContainer(container, data.powers[items[0]][items[1]]);
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
      const items = input.value.split(' - ');
      if (items.length <= 1) return false;
      fillPowerContainer(container, data.powers[items[0]][items[1]]);
      dialog.dialog('close');
    }
  });
  addEventObserver(button, 'click', () => {
    dialog.dialog('open');
    dialog.dialog('widget').position({ my: 'center', at: 'center', of: button });
  });
}

/*
  * Add the button to trigger the power choose dialog to all powers containers.
  *
  * @param {HTMLDocument} iframe - The character sheet iframe document.
  * @param {object} data - The Tormenta20 data.
  * */
function renderPowersButtons (iframe, data) {
  const powersContainer = pathQuerySelector(iframe, ['div.sheet-left-container', 'div.sheet-powers-and-abilities']);
  for (const parentContainer of powersContainer.querySelectorAll('div.repcontainer')) {
    for (const container of parentContainer.querySelectorAll('div.sheet-extra')) {
      renderPowerButton(container, data);
    }
  }
}
