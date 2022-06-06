'use strict'


T20.api = {
  getCharacter (characterId) {
    return T20.d20.Campaign.characters.get(characterId)
  },
  addAbility (characterId, power) {
    const char = T20.api.getCharacter(characterId)
    const getName = id => `repeating_abilities_${id}_nameability`
    const getDesc = id => `repeating_abilities_${id}_abilitydescription`
    const ability = char.attribs.create({ current: power.name })
    ability.save({ name: getName(ability.id) })
    char.attribs.create({ name: getDesc(ability.id), current: power.description })
    console.log({ power, attribs: char.attribs })
  }
}

// function add_power_to_character (id, power) {
//   "repeating_powers_-N3gUbZkjFQQEf96oNhZ_namepower"
//   "repeating_powers_-N3gUbZkjFQQEf96oNhZ_powerdescription"
// }