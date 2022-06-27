'use strict'

T20.modules.threats = {
  trimLines (str) {
    return str.replace(/\t/g, ' ').split(/\r?\n/).map(line => line.trim()).join(`\n`)
  },
  sample: `Wyvern ND 5
    Monstro 9, Grande
    Iniciativa +5, Percepção +9, faro, visão no escuro
    Defesa 21, fort +14, ref +9, von +5, imunidade a paralisia
    Pontos de vida 144
    Pontos de mana 22
    Deslocamento 9m (6q), voo 18m (12q)
    For 25, Des 12, Con 23, Int 6, Sab 12, Car 9
    Perícias: Percepção +11, Oficio (lenhador) +8, Acrobacia +17.
    Corpo a Corpo Garras +11 (1d6+4, 19) e Sopro quente +11 (1d6+4, 19)
    À Distância Bola de fogo +11 (1d12, 19)
    Agarrar aprimorado (livre): Se o wyvern acerta um ataque de mordida, pode fazer a manobra agarrar (bônus +19).
    Veneno: uma criatura que sofra dano do ferrão do wyvern deve fazer um teste de Fortitude (CD 22). Se falhar, sofre 1d12 pontos de dano de veneno por rodada durante 1d6 rodadas.
    Tesouro 1d4 doses de veneno de Wyvern jovem (CD para extrair 19, T$ 350 cada dose).`,
  skills: [
    'acrobacia', 'adestramento', 'atletismo', 'atuacao', 'cavalaria', 'conhecimento', 'cura',
    'diplomacia', 'enganacai', 'fortitude', 'furtividade', 'guerra', 'iniciativa', 'intimidacao',
    'intuicao', 'investigacao', 'jogatina', 'ladinagem', 'luta', 'misticismo', 'nobreza', 'oficio',
    'percepcao', 'pilotagem', 'pontaria', 'reflexos', 'religiao', 'sobrevivencia', 'vontade'
  ],
  extractData (text) {
    const lines = text.split(/\r?\n/)
    const tests = this.skills.map(skill => {
      if (skill === 'oficio') return /^per[iíÍ]cias.*?(of[iíÍ]c\D*?\((?<oficioDesc>.*?)\)\D*?(?<oficio>[-+]?\d+)).*$/i
      return RegExp(`^per[iíÍ]cias.*?(${skill.substr(0,4)}\\D*?(?<${skill}>[-+]?\\d+)).*$`, 'i')
    }).concat([
      /^(?!.*(desl|vida|mana).*)(?<type>\D+?)\W+(?<level>\d+)\W*(?<size>(min[uúÚ]sculo|pequeno|m[eéÉ]dio|grande|enorme|colossal))\W*$/i,
      /^(ini\D*?)(?<iniciativa>[-+]?\d+)\W*(per\D*?)(?<percepcao>[-+]?\d+)\W*(?<more1>.*)$/i,
      /^(resist[eêÊ]ncia\W*){0,1}((def\D*?)(?<defesa>[-+]?\d+)\W*){0,1}((fort\D*?)(?<fortitude>[-+]?\d+)\W*){0,1}((ref\D*?)(?<reflexos>[-+]?\d+)\W*){0,1}((von\D*?)(?<vontade>[-+]?\d+)\W*(?<more2>.*)){0,1}$/i,
      /(for\D*?)(?<for>(\d+|\W))\W*(des\D*?)(?<des>(\d+|\W))\W*(con\D*?)(?<con>(\d+|\W))\W*(int\D*?)(?<int>(\d+|\W))\W*(sab\D*?)(?<sab>(\d+|\W))\W*(car\D*?)(?<car>(\d+|\W))\W*$/i,
      /^(.*vida|pv)\W*(?<vida>\d+)$/i,
      /^(.*mana|pm)\W*(?<mana>\d+)$/i,
      /^(?<desl>desl.*)$/i,
      /^(?<equip>equip.*)$/i,
      /^(?<tesouro>tesouro.*)$/i,
    ])
    const nameNd = lines.shift().split('ND')
    const data = { name: nameNd[0], nd: 'ND' + (nameNd[1] || ' ?') }
    const attacks = []
    const rest = lines.filter(line => {
      const find = tests.filter(regex => {
        const match = line.match(regex)
        if (match) {
          for (const [key, value] of Object.entries(match.groups)) {
            if (value) data[key] = value
          }
        }
        return match
      })
      const isAttack = line.match(/^(ataques? )*(corpo[- ]a[- ]corpo|[aàÀ] dist[aâÂ]ncia).*/i)
      if (isAttack) attacks.push(line)
      return !find.length && !isAttack
    })
    return { data, attacks, rest }
  },
  getSkills (data) {
    const skillsToSync = {}
    this.skills.forEach(skill => {
      if (data[skill]) skillsToSync[skill] = data[skill]
    })
    // if (data.defesa) skillsToSync.defesa = data.defesa
    return skillsToSync
  },
  getAttribs: data => {
    const attribs = {
      for: data.for || 0, des: data.des || 0, con: data.con || 0,
      int: data.int || 0, sab: data.sab || 0, car: data.car || 0,
      vida: data.vida || 0, vidatotal: data.vida || 0,
      mana: data.mana || 0, manatotal: data.mana || 0,
      charnivel: data.level || 1, tlevel: data.nd,
      trace: (data.type || '') + (data.type && data.size && ` / `) + (data.size || ''),
      proficiencias: '',
    }
    if (data.desl) attribs.proficiencias += data.desl
    if (data.more1) attribs.proficiencias += `\n` + data.more1
    if (data.more2) attribs.proficiencias += `\n` + data.more2
    if (data.equip) attribs.proficiencias += `\n\n` + data.equip
    if (data.tesouro) attribs.proficiencias += `\n\n` + data.tesouro
    if (data.oficioDesc) attribs.oficionome = data.oficioDesc
    attribs.proficiencias = attribs.proficiencias.trim()
    return attribs
  },
  onLoad ($body) {
    const click = () => {
      const html = $(`
          <div style="height: 20px">
            <a style="float: right" class="btn add-sample">Inserir exemplo</a>
            <a style="float: right; margin-right: 5px" class="btn test-threat">Testar</a>
          </div>
          <p><label>Nome (primeira linha), abilidades, características e ataques</label>
            <textarea style="width: 98%;height:150px" name="info"></textarea></p>`)

      html.find(`[name=info]`).attr('placeholder', this.trimLines(this.sample))
      html.find('.add-sample').click(() => {
        if (html.find(`[name=info]`).val() && !confirm('Substituir valor atual?')) return
        html.find(`[name=info]`).val(this.trimLines(this.sample))
      })
      html.find('.test-threat').click(() => {
        const { data, attacks, rest } = this.extractData(this.trimLines(html.find(`[name=info]`).val()))
        const attribs = this.getAttribs(data)
        const skills = this.getSkills(data)
        const json = JSON.stringify({ name: data.name, attribs, skills, attacks, rest, data }, null, 2)
        const test = `<pre style="max-height: 400px">${json}</pre>`
        T20.utils.showDialog('Testar ameaça', test)
      })

      T20.utils.showDialog('Adicionar ameaça', $(html), async values => {
        if (!values.info) throw new Error('Valor inválido!')
        const { data, attacks, rest } = this.extractData(values.info)
        const attribs = this.getAttribs(data)
        const skills = this.getSkills(data)
        const charId = await T20.api.addCharacter(data.name, 'Ameaças', attribs, skills)
        attacks.forEach(nomeataque => T20.api.addAttribs(charId, 'repeating_attacks', { nomeataque }))
        T20.api.setAttribs(charId, { playername: '---', charnotes: rest.join(`\n`) })
        data.defesa && await T20.api.syncSkills(charId, { defesa: data.defesa })
        await T20.modules.macros.syncTokenActions(charId)
        await T20.api.closeSheet(charId)
      }, { width: '650px' })
    }
    const btn = $('<button class="btn" style="margin-right:8px;"><span class="pictos">&</span> Ameaça</button>')
    btn.click(click)
    $body.find('.superadd').after(btn)
  },
  onSheet: ($iframe, characterId) => {}
}