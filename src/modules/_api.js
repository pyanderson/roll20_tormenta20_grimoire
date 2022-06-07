'use strict'

T20.api = {
  getRowId: () => window.generateUUID().replace(/_/g, 'Z'),
  getCharacter (characterId) {
    return T20.d20.Campaign.characters.get(characterId)
  },
  addAttribs (characterId, attrGroup, data) {
    const char = this.getCharacter(characterId)
    const rowId = this.getRowId()
    Object.entries(data).forEach(([attrKey, attrValue]) => {
      char.attribs.create({ name: `${attrGroup}_${rowId}_${attrKey}`, current: attrValue })
      setTimeout(() => blurSheetJustCreatedElement(characterId, attrGroup, rowId, attrKey), 200)
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
  }
}

function blurSheetJustCreatedElement (characterId, attrGroup, rowId, attrKey) {
  $(`iframe[name="iframe_${characterId}"]`).contents()
    .find(`[data-groupname="${attrGroup}"] [data-reprowid="${rowId}"] [name="attr_${attrKey}"]`)[0]
    .dispatchEvent(new CustomEvent('blur'))
}