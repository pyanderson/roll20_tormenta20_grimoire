'use strict'

class CharacterSheet {
  iframe = null;
  character_id = null;
  character_data = null;
  spells_div = null;
  powers_div = null;
  spells = null;
  powers = null;
  powers_options = [];

  constructor(iframe, character_id) {
    this.load_data();
    this.iframe = iframe;
    this.character_id = character_id;
    this.character_data = this.read_character_data();
  }

  render() {
    const sheet = this;
    sheet.iframe.on('create', 'div', function () {
      const div = $(this);
      if (div.attr('class') == 'sheet-left-container') {
        sheet.spells_div = div.find('div.sheet-spells');
        sheet.powers_div = div.find('div.sheet-powers-and-abilities');
        sheet.render_spells_buttons();
        sheet.render_powers_buttons();
        sheet.render_cd();
      }
    })
    sheet.add_css();
  }

  render_spells_buttons() {
    const sheet = this;
    sheet.spells_div.on('click', 'button.repcontrol_add', function () {
      sheet.render_spells_dialogs_buttons(); // render dialogs to new spells.
    });
    sheet.render_spells_dialogs_buttons(); // render dialogs to speels that already exists.
  }

  render_spells_dialogs_buttons() {
    const sheet = this;
    for (const div_container of sheet.spells_div.find('div.repcontainer')) {
      const container = $(div_container);
      const circle = container.attr('data-groupname').slice(-1);
      for (const div of $(container).find('div.sheet-extra')) {
        sheet.render_spell_sheet($(div), circle);
      }
    }
  }

  render_spell_sheet(spell_sheet, circle) {
    const sheet = this;
    if (spell_sheet.find('button').length > 0) return;  // if the button already exists, ignore
    spell_sheet.prepend('<button class="sheet-singleline" name="choose-spell">Escolher Magia</button>');
    spell_sheet.prepend(create_spell_dialog(circle));
    const button = spell_sheet.find('button[name="choose-spell"]');
    const form = spell_sheet.find('form[name="spell-form"]');
    const input = form.find('input[name="spell-name"]');
    const dialog = spell_sheet.find('div[name="spell-dialog"]').dialog({
      autoOpen: false,
      closeText: '',
      buttons: {
        Confirmar: function () {form.submit();},
        Cancelar: function () {dialog.dialog('close');}
      },
      close: function () {
        form[0].reset();
        input.autocomplete('destroy');
      }
    });
    form.on('submit', function () {
      sheet.fill_pell_sheet(spell_sheet, sheet.spells[circle][input.val()]);
      dialog.dialog('close');
      return false;
    });
    input.on('keydown', function (e) {
      if (e.keyCode === 13) {
        form.submit();
        return false;
      }
    })
    $.widget('ui.autocomplete', $.ui.autocomplete, {
      _renderItem: function (ul, item) {
        return $('<li>')
          .attr('value', item.value)
          .attr('class', 'spell-item')
          .attr('style', 'list-style-type:none;')
          .append(item.label)
          .appendTo(ul);
      },
      _resizeMenu: function () {
        const width = parseInt(input.css('width').split('px')[0]) + 10;
        this.menu.element.outerWidth(`${width}px`);
      }
    });
    button.click(function () {
      input.autocomplete({source: Object.keys(sheet.spells[circle])});
      dialog.dialog('open');
      dialog.dialog('widget').position({my: 'center', at: 'center', of: button});
    });
  }

  fill_spell_sheet(sheet, spell) {
    if (spell === undefined) return;
    sheet.parent().find('input[name="attr_namespell"]').focus().val(spell['nome']);
    sheet.find('input[name="attr_spelltipo"]').focus().val(spell['tipo']);
    sheet.find('input[name="attr_spellexecucao"]').focus().val(spell['execução']);
    sheet.find('input[name="attr_spellalcance"]').focus().val(spell['alcance']);
    sheet.find('input[name="attr_spellduracao"]').focus().val(spell['duração']);
    sheet.find('input[name="attr_spellalvoarea"]').focus().val((spell['alvo'] || spell['área']));
    sheet.find('input[name="attr_spellresistencia"]').focus().val(spell['resistência']);
    sheet.find('textarea[name="attr_spelldescription"]').focus().val(spell['descrição']);
    if (spell['resistência'] != '') {
      sheet.find('input[name="attr_spellcd"]').focus().val(this.iframe.find('input[name="spell-cd-total"]').val());
    } else {
      sheet.find('input[name="attr_spellcd"]').focus().val('');
    }
  }

  render_powers_buttons() {
    const sheet = this;
    sheet.powers_div.on('click', 'button.repcontrol_add', function () {
      sheet.render_powers_dialogs_buttons(); // render dialogs to new powers.
    });
    sheet.render_powers_dialogs_buttons(); // render dialogs to powers that already exists.
  }

  render_powers_dialogs_buttons() {
    const sheet = this;
    for (const div_container of sheet.powers_div.find('div.repcontainer')) {
      for (const div of $(div_container).find('div.sheet-extra')) {
        sheet.render_power_sheet($(div));
      }
    }
  }

  render_power_sheet(power_sheet) {
    const sheet = this;
    if (power_sheet.find('button[name="choose-power"]').length > 0) return;  // if the button already exists, ignore
    power_sheet.prepend('<button class="sheet-singleline" name="choose-power">Escolher</button>');
    power_sheet.prepend(create_power_dialog());
    power_sheet.css('flex-direction', 'column').css('gap', '8px');
    const button = power_sheet.find('button[name="choose-power"]');
    const form = power_sheet.find('form[name="power-form"]');
    const input = form.find('input[name="power-name"]');
    const dialog = power_sheet.find('div[name="power-dialog"]').dialog({
      autoOpen: false,
      closeText: '',
      buttons: {
        Confirmar: function () {form.submit();},
        Cancelar: function () {dialog.dialog('close');}
      },
      close: function () {
        form[0].reset();
        input.autocomplete('destroy');
      }
    });
    form.on('submit', function () {
      const items = input.val().split(" - ");
      if (items.length <= 1) return false;
      sheet.fill_power_sheet(power_sheet, sheet.powers[items[0]][items[1]]);
      dialog.dialog('close');
      return false;
    });
    input.on('keydown', function (e) {
      if (e.keyCode === 13) {
        form.submit();
        return false;
      }
    })
    $.widget('ui.autocomplete', $.ui.autocomplete, {
      _renderItem: function (ul, item) {
        return $('<li>')
          .attr('value', item.label)
          .attr('class', 'select-option-item')
          .attr('style', 'list-style-type:none;')
          .append(item.label)
          .appendTo(ul);
      },
      _resizeMenu: function () {
        const width = parseInt(input.css('width').split('px')[0]) + 10;
        this.menu.element.outerWidth(`${width}px`);
      }
    });
    button.click(function () {
      input.autocomplete({ source: sheet.powers_options });
      dialog.dialog('open');
      dialog.dialog('widget').position({my: 'center', at: 'center', of: button});
    });
  }

  fill_power_sheet (sheet, power) {
    if (power === undefined) return;
    sheet.parent().find('input[name="attr_nameability"]').focus().val(power['nome']);
    sheet.find('textarea[name="attr_abilitydescription"]').focus().val(power['descrição']);
  }

  render_cd() {
    if (!this.has_cd) {
      this.spells_div.find('div.sheet-default-title').after(create_cd_div());
      this.load_cd();
    }
  }

  get has_cd() {
    return this.spells_div.find('div[name="spell-cd"]').length > 0
  }

  load_cd() {
    const sheet = this;
    const level = sheet.iframe.find('input[name="attr_charnivel"]');
    const cd_attr = sheet.spells_div.find('select[name="spell-cd-attr"]');
    const cd_extra = sheet.spells_div.find('input[name="spell-cd-extra"]');
    cd_attr.val(sheet.character_data['attr']).change();
    cd_extra.val(sheet.character_data['extra']).change();
    cd_attr.change(function () {
      sheet.character_data['attr'] = $(this).val();
      sheet.update_cd();
    });
    cd_extra.change(function () {
      sheet.character_data['extra'] = $(this).val();
      sheet.update_cd();
    });
    level.change(function () {
      sheet.update_cd();
    });
    for (const attr of ['for', 'des', 'con', 'int', 'sab', 'car']) {
      sheet.iframe.find(`input[name="attr_${attr}"]`).change(function () {
        setTimeout(function () {
          sheet.update_cd();
        }, 1000);
      });
    }
    sheet.update_cd();
  }

  update_cd() {
    this.write_character_data();
    this.spells_div.find('input[name="spell-cd-total"]').val(this.cd);
  }

  get cd() {
    const level = (parseInt(this.iframe.find('input[name="attr_charnivel"]').val()) || 0);
    const attr = this.spells_div.find('select[name="spell-cd-attr"]').val();
    const mod_value = (parseInt(this.iframe.find(`input[name="attr_${attr}_mod_fake"]`).val()) || 0);
    const extra = (parseInt(this.spells_div.find('input[name="spell-cd-extra"]').val()) || 0);
    return Math.floor(level / 2) + mod_value + extra + 10;
  }

  read_character_data() {
    const key = `grimoire_${this.character_id}`;
    const data = localStorage.getItem(key);
    if (data == null || data == '') {
      return {'attr': 'int', 'extra': '0'};
    }
    return JSON.parse(data);
  }

  write_character_data() {
    localStorage.setItem(`grimoire_${this.character_id}`, JSON.stringify(this.character_data));
  }

  parse_powers () {
    const sheet = this;
    for (const type of Object.keys(sheet.powers)) {
      for (const name of Object.keys(sheet.powers[type])) {
        sheet.powers_options.push(`${type} - ${name}`);
      }
    }
  }

  load_data() {
    const sheet = this;
    const spells_url = chrome.runtime.getURL('data/spells.json');
    const powers_url = chrome.runtime.getURL('data/powers.json');

    fetch(spells_url)
      .then((response) => response.json())
      .then((json) => sheet.spells = json);
    fetch(powers_url)
      .then((response) => response.json())
      .then((json) => sheet.powers = json)
      .then(() => sheet.parse_powers());
  }

  add_css() {
    const css_url = chrome.runtime.getURL('sheet.css');
    this.iframe.find('head').append($('<link>', {'href': css_url, 'rel': 'stylesheet', 'text': 'text/css'}));
  }
}
