/*
  * Generate the the CD row element.
  *
  * @returns {HTMLDivElement}
  * */
function generateCDRow () {
  const content = `
  <span class="spell-cd-item">CD</span>
    <input class="spell-cd-item spell-cd-total" style="margin-right: 5px; border: 2px solid black;" disabled="" value="" maxlength="2" name="spell-cd-total">
    <div class="spell-cd-item">=</div>
    <select class="spell-cd-item spell-cd-bottom-border spell-cd-attr" style="margin-right: 5px" name="spell-cd-attr">
        <option value="int">INT</option>
        <option value="sab">SAB</option>
        <option value="car">CAR</option>
        <option value="for">FOR</option>
        <option value="des">DES</option>
        <option value="con">CON</option>
    </select>
    <div class="spell-cd-item">+</div>
    <input class="spell-cd-item spell-cd-bottom-border spell-cd-extra" maxlength="2" type="text" spellcheck="false" value="0" name="spell-cd-extra">
  `;
  return createElement('div', { class: 'sheet-default-title spell-cd', name: 'spell-cd', innerHTML: content.trim() });
}

/*
  * Generate the spell dialog element.
  *
  * @param {string} circle - The spell circle.
  * @param {string[]} options - All available spell names for the circle.
  * @returns {HTMLDivElement}
  * */
function generateSpellDialog (circle, options) {
  const content = `
  <form name="spell-form">
    <fieldset>
      <label>
        <b>Nome</b><br>
        <input list="list-${circle}-spells" type="text" name="spell-name" value="" autocomplete="off">
        <datalist id="list-${circle}-spells">
        ${options.map((option) => `<option value="${option}">`).join('')}
         </datalist>
      </label>
      <!-- Allow form submission with keyboard without duplicating the dialog button -->
      <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
    </fieldset>
  </form>
  `;
  return createElement('div', { name: 'spell-dialog', title: `${circle}º Círculo`, innerHTML: content.trim() });
}

/*
  * Generate the power dialog element.
  *
  * @param {string[]} options - All available powers names.
  * @returns {HTMLDivElement}
  * */
function generatePowerDialog (options) {
  const content = `
  <form name="power-form">
    <fieldset>
      <label>
        <b>Nome</b><br>
        <input list="list-powers" type="text" name="power-name" value="" autocomplete="off">
        <datalist id="list-powers">
        ${options.map((option) => `<option value="${option}">`).join('')}
         </datalist>
      </label>
      <!-- Allow form submission with keyboard without duplicating the dialog button -->
      <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
    </fieldset>
  </form>
  `;
  return createElement('div', { name: 'power-dialog', title: 'Habilidade ou Poder', innerHTML: content.trim() });
}
