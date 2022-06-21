'use strict'

T20.api = {
  getRowId: () => window.generateUUID().replace(/_/g, 'Z'),
  getCharacter (characterId) {
    T20.d20.Campaign.characters.fetch()
    return T20.d20.Campaign.characters.get(characterId)
  },
  getIframe (char) {
    return $(`[data-characterid=${char.id || char}] iframe`).contents()
  },
  async openSheet (char) {
    const charMenu = () => $(`.character[data-itemid=${char.id || char}]`)
    const charTitle = () => $(`[data-characterid=${char.id || char}]`).closest('.ui-dialog').find('.ui-dialog-titlebar')
    const charSheet = () => this.getIframe(char).find('[data-tab=charsheet]')
    await checkTimeout(() => charMenu().length)
    charMenu().click()
    await checkTimeout(() => charTitle().length)
    await sleep(50)
    charTitle().dblclick()
    await checkTimeout(() => charSheet().length)
    await sleep(50)
    charSheet().click()
    await sleep(500)
  },
  async closeSheet (char) {
    const close = () => $(`[data-characterid=${char.id || char}]`).closest('.ui-dialog').find('.ui-dialog-titlebar-close')
    await checkTimeout(() => close().length)
    close().click()
    await sleep(500)
  },
  async refreshSheet (char) {
    await this.closeSheet(char)
    await this.openSheet(char)
  },
  async addCharacter (name, folder, attribs, skills) {
    const newChar = T20.d20.Campaign.characters.create({ name })
    T20.d20.journal.addItemToFolderStructure(newChar.id, T20.api.getFolderId(folder))
    if (attribs) this.setAttribs(newChar.id, attribs)
    await this.openSheet(newChar)
    skills && await this.syncSkills(newChar, skills)
    return newChar.id
  },
  getFolderId (folderName) {
    const folders = JSON.parse(T20.d20.Campaign.attributes.journalfolder)
    const find = folders.find(folder => folder.n === folderName)
    if (find) return find.id
    T20.d20.journal.addFolderToFolderStructure(folderName)
    return this.getFolderId(folderName)
  },
  bootstrapFromHtml (html) {
    const $el = $(html)
    $el.find('*[name^="attr_"]').each(function () {
      const $thisel = $(this)
      const _attrname = $thisel.attr('name').substring(5).toLowerCase()
      if ($thisel.prop('disabled')) {
        T20.d20.journal.customSheets.availableAttributes[_attrname] = this.attributes.value.nodeValue || ''
        T20.d20.journal.updateSheetDeps(_attrname, T20.d20.journal.customSheets.availableAttributes[_attrname])
        $thisel.attr('data-formula', this.attributes.value.nodeValue)
        T20.d20.journal.customSheets.reservedAttributes[_attrname] = true
      } else {
        T20.d20.journal.customSheets.availableAttributes[_attrname] = $thisel.val() || ''
      }
    })
    return $el
  },
  setAttribs (characterId, attribs) {
    const char = this.getCharacter(characterId)
    Object.entries(attribs).forEach(([name, current]) => {
      const find = char.attribs.models.find(attr => attr.name === name)
      if (find) find.save({ name, current })
      else char.attribs.create({ name, current })
    })
  },
  async getAttrib (characterId, attrib) {
    const input = () => this.getIframe(characterId).find(`[name=attr_${attrib}]`)
    await checkTimeout(() => {
      return input().length && !input().val().startsWith('@')
    })
    return input().val()
  },
  async syncSkills (characterId, skills) {
    const attribs = {}
    for (const name in skills) {
      const current = parseInt(skills[name])
      const total = parseInt(await this.getAttrib(characterId, name + 'total'))
      attribs[`${name}outros`] = current - total
    }
    this.setAttribs(characterId, attribs)
    await this.refreshSheet(characterId)
  },
  addAttribs (characterId, attrGroup, data) {
    const char = this.getCharacter(characterId)
    const rowId = this.getRowId()
    Object.entries(data).forEach(([attrKey, current]) => {
      char.attribs.create({ name: `${attrGroup}_${rowId}_${attrKey}`, current })
      setTimeout(() => this.blurSheetJustCreatedGroupElement(characterId, attrGroup, rowId, attrKey), 200)
    })
  },
  addAbility (characterId, power) {
    this.addAttribs(characterId, 'repeating_abilities', {
      nameability: power.name,
      abilitydescription: power.description,
    })
  },
  addPower (characterId, power) {
    this.addAttribs(characterId, 'repeating_powers', {
      namepower: power.name,
      powerdescription: power.description,
    })
  },
  addSpell (characterId, spell) {
    this.addAttribs(characterId, 'repeating_spells' + spell.circle, {
      namespell: spell.name,
      spelltipo: spell.type,
      spellcd: spell.resistance && '[[ @{magia_cd} ]]',
      spellexecucao: spell.action,
      spellalcance: spell.range,
      spellduracao: spell.time,
      spellalvoarea: spell.area || spell.target,
      spellresistencia: spell.resistance,
      spelldescription: spell.description,
    })
  },
  addEquipment (characterId, equipment) {
    if (equipment.type !== 'arma' || equipment.weight) {
      this.addAttribs(characterId, 'repeating_equipment', {
        equipquantity: equipment.amount,
        equipname: equipment.name,
        equipweight: equipment.weight
      })
    }
    if (equipment.type === 'arma') {
      this.addWeapon(characterId, equipment)
    }
  },
  addWeapon (characterId, weapon) {
    const data = {
      nomeataque: weapon.name,
      bonusataque: weapon.rollBonus,
      danoataque: weapon.damageDice,
      danoextraataque: weapon.damageBonus,
      margemcriticoataque: weapon.criticalRange,
      multiplicadorcriticoataque: weapon.criticalMultiplier,
      ataquedescricao: '',
      ataquepericia: { pon: '@{pontariatotal}', lut: '@{lutatotal}' }[weapon.rollSkill] || '@{lutatotal}',
      ataquetipodedano: weapon.subtype,
      ataquealcance: { short: 'Curto', medium: 'Médio' }[weapon.range] || '',
      modatributodano: weapon.damageAttribute === 'for' ? '@{for_mod}' : '0',
    }
    if (weapon.damageDiceTwoHands) {
      this.addAttribs(characterId, 'repeating_attacks', {
        ...data, nomeataque: `${weapon.name} (uma mão)`
      })
      this.addAttribs(characterId, 'repeating_attacks', {
        ...data, nomeataque: `${weapon.name} (duas mãos)`, danoataque: weapon.damageDiceTwoHands
      })
    } else {
      this.addAttribs(characterId, 'repeating_attacks', data)
    }
  },
  deleteAllTokenActions (characterId) {
    const char = this.getCharacter(characterId)
    char.abilities.fetch()
    ;[...char.abilities.models].forEach(ability => {
      if (!ability.attributes.action.startsWith('   ')) return
      T20.d20.Campaign.players.each(player => {
        player.removeFromMacroBar(ability.id)
      })
      ability.destroy()
    })
  },
  addTokenAction (characterId, name, actionEl, macro) {
    const char = this.getCharacter(characterId)
    const action = '   ' + char.expandReferencesInRoll(macro || actionEl.val(), actionEl)
    const newabil = char.abilities.create({ name, action, istokenaction: true })
    this.getIframe(char).find('.abilities .body').append(newabil.view.$el)
    newabil.view.rebindEvents(char)
  },
  blurSheetJustCreatedGroupElement (characterId, attrGroup, rowId, attrKey) {
    const el = this.getIframe(characterId)
      .find(`[data-groupname="${attrGroup}"] [data-reprowid="${rowId}"] [name="attr_${attrKey}"]`)[0]
    if (el) el.dispatchEvent(new CustomEvent('blur'))
  }
}