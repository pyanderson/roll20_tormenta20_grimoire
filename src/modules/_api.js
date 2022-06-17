'use strict'

T20.api = {
  getRowId: () => window.generateUUID().replace(/_/g, 'Z'),
  getCharacter (characterId) {
    return T20.d20.Campaign.characters.get(characterId)
  },
  addCharacter (name, folder, attribs, skills) {
    const newChar = T20.d20.Campaign.characters.create({ name })
    T20.d20.journal.addItemToFolderStructure(newChar.id, T20.api.getFolderId(folder))
    if (attribs) this.setAttribs(newChar.id, attribs)
    newChar.view.showDialog()
    setTimeout(() => {
      if (skills) this.syncSkills(newChar.id, skills)
      newChar.view.reRender()
    }, 500)
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
  getAttrib (characterId, attrib) {
    const char = this.getCharacter(characterId)
    return char.view.$el.find('iframe').contents().find(`[name=attr_${attrib}]`).val()
  },
  syncSkills (characterId, skills) {
    const attribs = {}
    Object.entries(skills).forEach(([name, current]) => {
      attribs[`${name}outros`] = current - this.getAttrib(characterId, name + 'total')
    })
    this.setAttribs(characterId, attribs)
  },
  addAttribs (characterId, attrGroup, data) {
    const char = this.getCharacter(characterId)
    const rowId = this.getRowId()
    Object.entries(data).forEach(([attrKey, current]) => {
      char.attribs.create({ name: `${attrGroup}_${rowId}_${attrKey}`, current })
      setTimeout(() => blurSheetJustCreatedGroupElement(characterId, attrGroup, rowId, attrKey), 200)
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
    char.view.$iframe.find('.abilities .body').append(newabil.view.$el)
    newabil.view.rebindEvents(char)
  }
}

function blurSheetJustCreatedElement (characterId, attrKey) {
  $(`iframe[name="iframe_${characterId}"]`).contents()
    .find(`[name="attr_${attrKey}"]`)[0]
    .dispatchEvent(new CustomEvent('blur'))
}

function blurSheetJustCreatedGroupElement (characterId, attrGroup, rowId, attrKey) {
  $(`iframe[name="iframe_${characterId}"]`).contents()
    .find(`[data-groupname="${attrGroup}"] [data-reprowid="${rowId}"] [name="attr_${attrKey}"]`)[0]
    .dispatchEvent(new CustomEvent('blur'))
}