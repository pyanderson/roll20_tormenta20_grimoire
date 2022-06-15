const value = `Wyvern ND 5
Monstro 9, Grande
Iniciativa +5, Percepção +9, faro, visão no escuro
Defesa 21, fort +14, ref +9, von +5, imunidade a paralisia
Pontos de vida 144
Pontos de mana 22
Deslocamento 9m (6q), voo 18m (12q)
For 25, Des 12, Con 23, Int 6, Sab 12, Car 9
Perícias: Percepção +11, Oficio (lenhador) +8, Acrobacia +17.
Tesouro 1d4 doses de veneno de Wyvern jovem (CD para extrair 19, T$ 350 cada dose).`

// ataques corPo a corPo Mordida +17 (2d6+7) e ferrão +17 (1d6+7 mais veneno).
// agarrar aPrImoraDo (lIvre) Se o wyvern acerta um ataque de mordida, pode fazer a manobra agarrar (bônus +19). veneno Uma criatura que sofra dano do ferrão do wyvern
// deve fazer um teste de Fortitude (CD 22). Se falhar, so- fre 1d12 pontos de dano de veneno por rodada durante 1d6 rodadas.

const lines = value.split(/\r?\n/)
const skills = [
  'acro', 'ades', 'atle', 'atua', 'cava', 'conh', 'cura', 'dipl', 'enga', 'fort',
  'furt', 'guer', 'inic', 'inti', 'intu', 'inve', 'joga', 'ladi', 'luta', 'mist',
  'nobr', 'ofic', 'perc', 'pilo', 'pont', 'refl', 'reli', 'sobr', 'vont'
]

const tests = skills.map(skill => {
  if (skill === 'ofic') return /^per[íi]cias.*?(of[íi]c\D*?\((?<oficDesc>.*?)\)\D*?(?<ofic>[-+]?\d+)).*$/i
  return RegExp(`^per[íi]cias.*?(${skill}\\D*?(?<${skill}>[-+]?\\d+)).*$`, 'i')
}).concat([
  /^(?!.*(desl|vida|mana).*)(?<type>\D+?)\W+(?<level>\d+)\W*(?<size>\D*)$/i,
  /^(ini\D*?)(?<ini>[-+]?\d+)\W*(per\D*?)(?<per>[-+]?\d+)\W*(?<more1>.*)$/i,
  /^(def\D*?)(?<def>[-+]?\d+)\W*(fort\D*?)(?<fort>[-+]?\d+)\W*(ref\D*?)(?<ref>[-+]?\d+)\W*(von\D*?)(?<von>[-+]?\d+)\W*(?<more2>.*)$/i,
  /^(for\D*?)(?<for>(\d+|\W))\W*(des\D*?)(?<des>(\d+|\W))\W*(con\D*?)(?<con>(\d+|\W))\W*(int\D*?)(?<int>(\d+|\W))\W*(sab\D*?)(?<sab>(\d+|\W))\W*(car\D*?)(?<car>(\d+|\W))\W*$/i,
  /^(.*vida)\W*(?<vida>\d+)$/i,
  /^(.*mana)\W*(?<mana>\d+)$/i,
  /^(?<desl>desl.*)$/i,
  /^(?<equip>equip.*)$/i,
  /^(?<tesouro>tesouro.*)$/i,
])

const data = { name: lines[0] }

lines.forEach(line => {
  tests.forEach(regex => {
    const match = line.match(regex)
    if (match) Object.assign(data, match.groups)
  })
})

console.log(data)