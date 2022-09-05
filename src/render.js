'use strict'

function create_cd_div() {
  return `
  <div class="sheet-default-title spell-cd" name="spell-cd">
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
  </div>
  `;
}

function create_spell_dialog(circle) {
  return `
  <div name="spell-dialog" title="${circle}º Círculo">
    <form name="spell-form">
      <fieldset>
        <input type="text" name="spell-name" value="">
        <!-- Allow form submission with keyboard without duplicating the dialog button -->
        <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
      </fieldset>
    </form>
  </div>
  `;
}

function create_power_dialog() {
  return `
  <div name="power-dialog" title="Escolha um Poder">
    <form name="power-form">
      <fieldset>
        <label>
          <b>Tipo</b><br>
          <select name="power-type"></select>
        </label>
        <label>
          <b>Nome</b><br>
          <input type="text" name="power-name" value="">
        </label>
        <!-- Allow form submission with keyboard without duplicating the dialog button -->
        <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
      </fieldset>
    </form>
  </div>
  `;
}