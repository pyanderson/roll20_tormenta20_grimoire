'use strict'

T20.modules.threats = {
  onLoad: $body => {
    const trimLines = str => {
      return str.replace(/\t/g, ' ').split(/\r?\n/).map(line => line.trim()).join(`\n`)
    }
    const click = () => {
      const sample = `Wyvern ND 5
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
        Tesouro 1d4 doses de veneno de Wyvern jovem (CD para extrair 19, T$ 350 cada dose).`

      const html = $(`
          <div style="height: 20px"><a style="float: right" class="btn add-sample">Inserir exemplo</a></div>
          <p><label>Nome (primeira linha), abilidades, características e ataques - Um por linha!</label>
            <textarea style="width: 98%;height:150px" name="info"></textarea></p>`)

      html.find(`[name=info]`).attr('placeholder', trimLines(sample))
      html.find('.add-sample').click(() => html.find(`[name=info]`).val(trimLines(sample)))

      T20.utils.showDialog('Adicionar ameaça', $(html), async values => {
        const lines = values.info.split(/\r?\n/)
        const skills = [
          'acrobacia', 'adestramento', 'atletismo', 'atuacao', 'cavalaria', 'conhecimento', 'cura',
          'diplomacia', 'enganacai', 'fortitude', 'furtividade', 'guerra', 'iniciativa', 'intimidacao',
          'intuicao', 'investigacao', 'jogatina', 'ladinagem', 'luta', 'misticismo', 'nobreza', 'oficio',
          'percepcao', 'pilotagem', 'pontaria', 'reflexos', 'religiao', 'sobrevivencia', 'vontade'
        ]
        const tests = skills.map(skill => {
          if (skill === 'oficio') return /^per[íi]cias.*?(of[íi]c\D*?\((?<oficioDesc>.*?)\)\D*?(?<oficio>[-+]?\d+)).*$/i
          return RegExp(`^per[íi]cias.*?(${skill.substr(0,4)}\\D*?(?<${skill}>[-+]?\\d+)).*$`, 'i')
        }).concat([
          /^(?!.*(desl|vida|mana).*)(?<type>\D+?)\W+(?<level>\d+)\W*(?<size>(min[uú]sculo|pequeno|m[eé]dio|grande|enorme|colossal))\W*$/i,
          /^(ini\D*?)(?<iniciativa>[-+]?\d+)\W*(per\D*?)(?<percepcao>[-+]?\d+)\W*(?<more1>.*)$/i,
          /^(def\D*?)(?<defesa>[-+]?\d+)\W*(fort\D*?)(?<fortitude>[-+]?\d+)\W*(ref\D*?)(?<reflexos>[-+]?\d+)\W*(von\D*?)(?<vontade>[-+]?\d+)\W*(?<more2>.*)$/i,
          /^(for\D*?)(?<for>(\d+|\W))\W*(des\D*?)(?<des>(\d+|\W))\W*(con\D*?)(?<con>(\d+|\W))\W*(int\D*?)(?<int>(\d+|\W))\W*(sab\D*?)(?<sab>(\d+|\W))\W*(car\D*?)(?<car>(\d+|\W))\W*$/i,
          /^(.*vida)\W*(?<vida>\d+)$/i,
          /^(.*mana)\W*(?<mana>\d+)$/i,
          /^(?<desl>desl.*)$/i,
          /^(?<equip>equip.*)$/i,
          /^(?<tesouro>tesouro.*)$/i,
        ])
        const data = { name: lines.shift() }
        const attacks = []
        const linesWithoutMatch = lines.filter(line => {
          let find = tests.filter(regex => {
            const match = line.match(regex)
            if (match) Object.assign(data, match.groups)
            return match
          })
          const isAttack = line.match(/^(ataque )*(corpo[- ]a[- ]corpo|[aàÀ] dist[aâÂ]ncia).*/i)
          if (isAttack) attacks.push(line)
          return !find.length && !isAttack
        })
        const skillsToSync = {}
        skills.forEach(skill => {
          if (data[skill]) skillsToSync[skill] = data[skill]
        })
        const characterId = await T20.api.addCharacter(data.name, 'Ameaças', {
          for: data.for, des: data.des, con: data.con, int: data.int, sab: data.sab, car: data.car,
          vida: data.vida, vidatotal: data.vida, mana: data.mana, manatotal: data.mana,
          charnivel: data.level, trace: data.type + ` / ` + data.size,
          proficiencias: data.desl + `\n\n` + data.more1 + `\n` + data.more2 + `\n\n` + data.tesouro,
          oficionome: data.oficioDesc || '',
        }, skillsToSync)
        attacks.forEach(attack => {
          T20.api.addAttribs(characterId, 'repeating_attacks', {
            nomeataque: attack, ataquepericia: '0'
          })
        })
        T20.api.setAttribs(characterId, { playername: '---', charnotes: linesWithoutMatch.join(`\n`) })
        await T20.api.syncSkills(characterId, { defesa: data.defesa })
        await T20.modules.macros.syncTokenActions(characterId)
        await T20.api.closeSheet(characterId)
      }, { width: '650px' })
    }
    const btn = $('<button class="btn" style="margin-right:8px;"><span class="pictos">&</span> Ameaça</button>')
    btn.click(click)
    $body.find('.superadd').after(btn)

    // TODO remove this click
    $('.tabmenu [title=Journal] a').click()
  },
  onSheet: ($iframe, characterId) => {}
}