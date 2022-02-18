'use strict'

class CharacterSheet {
  iframe = null;
  character_id = null;
  character_data = null;
  spells_div = null;
  spells = null;

  constructor(iframe, character_id) {
    this.load_spells();
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
        sheet.render_buttons();
        sheet.render_cd();
      }
    })
    sheet.add_css();
  }

  render_buttons() {
    const sheet = this;
    sheet.spells_div.on('click', 'button.repcontrol_add', function () {
      sheet.render_dialogs(); // render dialogs to new spells.
    });
    sheet.render_dialogs(); // render dialogs to speels that already exists.
  }

  render_dialogs() {
    for (const div_container of this.spells_div.find('div.repcontainer')) {
      const container = $(div_container);
      const circle = container.attr('data-groupname').slice(-1);
      for (const div of $(container).find('div.sheet-extra')) {
        this.render_spell_sheet($(div), circle);
      }
    }
  }

  render_spell_sheet(spell_sheet, circle) {
    const sheet = this;
    if (spell_sheet.find('button').length > 0) {
      return
    }
    spell_sheet.prepend('<button class="sheet-singleline" name="choose-spell">Escolher Magia</button>')
    spell_sheet.prepend(create_dialog(circle));
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
      sheet.fill_sheet(spell_sheet, sheet.spells[circle][input.val()]);
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

  fill_sheet(sheet, spell) {
    if (spell === undefined) {
      return
    }
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

  load_spells() {
    const sheet = this;
    const url = chrome.runtime.getURL('data/spells.json');
    fetch(url)
      .then((response) => response.json())
      .then((json) => sheet.spells = json);
  }

  add_css() {
    const css_url = chrome.runtime.getURL('sheet.css');
    this.iframe.find('head').append($('<link>', {'href': css_url, 'rel': 'stylesheet', 'text': 'text/css'}));
  }
}
