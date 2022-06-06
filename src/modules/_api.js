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
  }
}