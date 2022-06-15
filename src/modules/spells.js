'use strict'

T20.modules.push({
  name: 'spells',
  onLoad: $body => {},
  onSheet: ($iframe, characterId) => {

    $iframe.find('.sheet-spells .sheet-default-title').after(T20.api.bootstrapFromHtml(`
      <div class="sheet-default-title spell-cd">
        <span class="spell-cd-item">CD</span>
        <input name="attr_magia_cd" class="spell-cd-item spell-cd-total" disabled="true"
               style="margin-right: 5px; border: 2px solid black;"
               value="(10 + @{metade_do_nivel} + @{magia_atributo} + @{magia_bonus})">
        <div class="spell-cd-item">=</div>
        <select name="attr_magia_atributo" class="spell-cd-item spell-cd-bottom-border spell-cd-attr"
                style="margin-right: 5px">
            <option value="@{int_mod}">INT</option>
            <option value="@{sab_mod}">SAB</option>
            <option value="@{car_mod}">CAR</option>
        </select>
        <div class="spell-cd-item">+</div>
        <input class="spell-cd-item spell-cd-bottom-border spell-cd-extra"
               maxlength="2" type="text" spellcheck="false" value="0" name="attr_magia_bonus">
      </div>`))

    const click = function () {
      const button = $(this)
      const circle = button.attr('rel')
      T20.utils.showSelectDialog(`Magias de ${circle}º círculo`, T20.books.spells[circle], selected => {
        T20.api.addSpell(characterId, selected)
      })
    }

    $iframe.find('.sheet-containerspelllist').each((i, el) => {
      const circle = [1, 3, 5, 2, 4][i]
      $(el).find('.repcontrol_add')
        .after($(`<button rel="${circle}" class="btn repcontrol_more">...</button>`).click(click))
    })
  }
})