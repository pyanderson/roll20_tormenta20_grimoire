'use strict';

// ---------------------------------------------------------------------------
// TODO - Implementar Futuramente
// ---------------------------------------------------------------------------
// [ ] ataquealcance para ataques à distância (depende da arma do monstro)
// ---------------------------------------------------------------------------


import { openDialog } from '../common/dialog-manager';
import { createElement } from '../common/helpers';
import { ImportExportSheet } from './import-export';

// ---------------------------------------------------------------------------
// Mapeamentos
// ---------------------------------------------------------------------------

const SKILL_NAME_TO_FIELD = {
  Acrobacia: 'acrobacia',
  Adestramento: 'adestramento',
  Atletismo: 'atletismo',
  'Atuação': 'atuacao',
  Cavalgar: 'cavalgar',
  Conhecimento: 'conhecimento',
  Cura: 'cura',
  Diplomacia: 'diplomacia',
  'Enganação': 'enganacao',
  Fortitude: 'fortitude',
  Furtividade: 'furtividade',
  Guerra: 'guerra',
  Iniciativa: 'iniciativa',
  'Intimidação': 'intimidacao',
  'Intuição': 'intuicao',
  'Investigação': 'investigacao',
  Jogatina: 'jogatina',
  Ladinagem: 'ladinagem',
  Luta: 'luta',
  Misticismo: 'misticismo',
  Nobreza: 'nobreza',
  'Percepção': 'percepcao',
  Pilotagem: 'pilotagem',
  Pontaria: 'pontaria',
  Reflexos: 'reflexos',
  'Religião': 'religiao',
  'Sobrevivência': 'sobrevivencia',
  Vontade: 'vontade',
};

// Atributo base de cada perícia (para preservar o atributo correto no import)
const SKILL_ATTR_MAP = {
  acrobacia:    'des', adestramento: 'car', atletismo:    'for',
  atuacao:      'car', cavalgar:     'des', conhecimento: 'int',
  cura:         'sab', diplomacia:   'car', enganacao:    'car',
  fortitude:    'con', furtividade:  'des', guerra:       'int',
  iniciativa:   'des', intimidacao:  'car', intuicao:     'sab',
  investigacao: 'int', jogatina:     'car', ladinagem:    'des',
  luta:         'for', misticismo:   'int', nobreza:      'int',
  percepcao:    'sab', pilotagem:    'des', pontaria:     'des',
  reflexos:     'des', religiao:     'sab', sobrevivencia:'sab',
  vontade:      'sab',
};

// Fórmulas de atributo JDA por atributo
const SKILL_ATTR_FORMULA = {
  for: '@{for_mod} + @{condicaoperfisico} + @{condicaocego}',
  des: '@{des_mod} + @{condicaoperfisico} + @{condicaocego}',
  con: '@{con_mod} + @{condicaoperfisico}',
  int: '@{int_mod} + @{condicaopermental}',
  sab: '@{sab_mod} + @{condicaopermental}',
  car: '@{car_mod} + @{condicaopermental}',
};

const SIZE_MAP = {
  'Minúsculo': -4,
  Pequeno: -2,
  'Médio': 0,
  Grande: 1,
  Enorme: 2,
  Colossal: 4,
};

const ATTACK_SKILL_MELEE =
  '@{lutatotal}+@{condicaomodataquecc}+@{condicaomodataque}';
const ATTACK_SKILL_RANGED =
  '@{pontariatotal}+@{condicaomodataquedis}+@{condicaomodataque}';

// ---------------------------------------------------------------------------
// Helpers de cálculo de ataque
// ---------------------------------------------------------------------------

/**
 * Converte ND para nível equivalente.
 * NDs fracionários (1/4, 1/2) resultam em 1. S/S+ resultam em 20.
 */
function ndToLevel(nd) {
  const s = String(nd);
  if (s === 'S' || s === 'S+') return 20;
  if (s.includes('/')) {
    const [a, b] = s.split('/');
    return Math.max(1, Math.round(parseInt(a) / parseInt(b)));
  }
  return Math.max(1, parseInt(s) || 1);
}

/**
 * Retorna o bônus de treino de perícia para um dado nível.
 * Nível  1-6  → +2
 * Nível  7-14 → +4
 * Nível 15+   → +6
 */
function treinoBonus(level) {
  if (level >= 15) return 6;
  if (level >= 7) return 4;
  return 2;
}

/**
 * Calcula o bônus outros de uma perícia para chegar no total informado.
 * A ficha JDA aplica automaticamente: atributo_mod + treino + floor(level/2) + outros
 * Portanto: outros = total - atributo_mod - treino - floor(level/2)
 */
function calcSkillOutros({ bonusTotal, attrMod, level, trained }) {
  const treino = trained ? treinoBonus(level) : 0;
  const nivelBonus = Math.floor(level / 2);
  return bonusTotal - attrMod - treino - nivelBonus;
}

/**
 * Decompõe a string de dano nos campos da ficha.
 * Ex: "2d6+8, 18/x3"            → { dano: "2d6+8", critMult: "3", critRange: "18" }
 * Ex: "2d6+10 impacto"          → { dano: "2d6+10", descricao: "2d6+10 impacto" }
 * Ex: "1d8+4 alcance 4,5m"      → { dano: "1d8+4", alcance: "4,5m", descricao: "1d8+4 alcance 4,5m" }
 * Ex: "2d8+18 mais 2d6 fogo"    → { dano: "2d8+18", dadoExtra: "2d6" }
 * Texto de tipo de dano e alcance são removidos do campo dano mas preservados na descricao.
 */
function parseDamage(damageStr) {
  let s = (damageStr || '').trim();
  const descricao = s; // texto completo original para ataquedescricao

  // Margem + multiplicador crítico: "18/x3" ou "19/x2"
  let critMult = '2';
  let critRange = '20';
  const critFullMatch = s.match(/,?\s*(\d{2})\/[xX](\d+)/);
  if (critFullMatch) {
    critRange = critFullMatch[1];
    critMult = critFullMatch[2];
    s = (s.slice(0, critFullMatch.index) + s.slice(critFullMatch.index + critFullMatch[0].length))
      .trim().replace(/^,/, '').trim();
  } else {
    // Só multiplicador: ", x3"
    const critMultMatch = s.match(/,\s*[xX](\d+)/);
    if (critMultMatch) {
      critMult = critMultMatch[1];
      s = s.slice(0, critMultMatch.index).trim();
    }
  }

  // Alcance: "alcance 4,5m" ou "alcance 9m"
  let alcance = '1,5m';
  const alcanceMatch = s.match(/alcance\s+([\d,.]+m)/i);
  if (alcanceMatch) {
    alcance = alcanceMatch[1];
    s = s.slice(0, alcanceMatch.index).trim().replace(/,$/, '').trim();
  }

  // Dano extra: " mais <dado>" — só registra se for expressão de dado válida
  let dadoExtra = '';
  const maisMatch = s.match(/\s+mais\s+(.+)$/i);
  if (maisMatch) {
    const extraStr = maisMatch[1].trim();
    s = s.slice(0, maisMatch.index).trim();
    const dadoMatch = extraStr.match(/^(\d*d\d+(?:[+\-]\d+)?)/);
    if (dadoMatch) {
      dadoExtra = dadoMatch[1];
    }
  }

  // Remove texto de tipo de dano após o dado principal: "2d6+10 impacto" → "2d6+10"
  const danoClean = s.replace(/^(\d*d\d+(?:[+\-]\d+)?)\s+\w.*$/, '$1');
  const dano = /^\d*d\d+/.test(danoClean) ? danoClean : s;

  return { dano, dadoExtra, critMult, critRange, alcance, descricao };
}

// ---------------------------------------------------------------------------
// Conversão monstro → dados de importação
// ---------------------------------------------------------------------------

/**
 * Converte um objeto _monster para o formato aceito pelo importNewData().
 *
 * @param {Object} monster
 * @returns {Object}
 */
export function monsterToSheetData(monster) {
  const data = {
    isJDA: true,
    playername: '',
    trace: monster.type || '',
    torigin: '',
    tlevel: '',
    charnivel: monster.nd ? String(ndToLevel(monster.nd)) : '',
  };

  // Atributos
  const attrs = monster.attributes || {};
  const attrVal = (key) => {
    const v = attrs[key];
    if (v === null || v === undefined) return '0';
    return String(v);
  };
  data.for = attrVal('str');
  data.des = attrVal('dex');
  data.con = attrVal('con');
  data.int = attrVal('int');
  data.sab = attrVal('wis');
  data.car = attrVal('cha');
  data.menace_name = monster.name;

  // Campo de tipo/tamanho/papel da ficha de ameaça
  const roleStr = monster.role ? ` [${monster.role}]` : '';
  const subtypeStr = monster.subtype ? ` (${monster.subtype})` : '';
  data.menace_type_size = `${monster.type}${subtypeStr} ${monster.size}${roleStr}`.trim();

  // Outras percepções do monstro
  data.menace_perception = (monster.other_perception || []).join(', ');

  // Resistência do monstro (imunidades, redução de dano, vulnerabilidades)
  data.menace_resist = [
    (monster.immunities || []).length > 0 ? `Imunidades: ${monster.immunities.join(', ')}` : '',
    Object.keys(monster.damage_reduction || {}).length > 0
      ? `RD: ${Object.entries(monster.damage_reduction).map(([k, v]) => (k === 'normal' ? `${v}` : `${v} a ${k}`)).join(', ')}`
      : '',
    (monster.vulnerabilities || []).length > 0 ? `Vulnerabilidades: ${monster.vulnerabilities.join(', ')}` : '',
  ].filter(Boolean).join(' | ');

  // PV e PM
  data.vidatotal = String(monster.hp || 0);
  data.vida = String(monster.hp || 0);
  data.vidatemp = '0';
  data.manatotal = String(monster.pm || 0);
  data.mana = String(monster.pm || 0);
  data.manatemp = '0';

  // Deslocamento
  data.deslocamento = monster.movement;
  data.menace_desloc = data.deslocamento;

  // Tamanho
  data.tamanho = String(SIZE_MAP[monster.size] ?? 0);

  data.charnotes = '';

  // Tesouro
  data.menace_treasures = monster.treasure || '';

  // Campos obrigatórios restantes
  data.proficiencias = '';
  data.ts = '0';
  data.to = '0';
  data.oficionome = '';
  data.oficio2nome = '';
  data.divindade = '';
  data.modatributodefesa = 'des_mod';
  data.cdatributo = '@{int_mod} + @{condicaopermental}';
  data.cdequips = '0';
  data.cdpoderes = '0';
  data.cdoutros = '0';
  data.extraslot = '0';

  // Nível equivalente baseado na ND
  const monsterLevel = ndToLevel(monster.nd);
  const forMod = parseInt(attrVal('str')) || 0;
  const desMod = parseInt(attrVal('dex')) || 0;

  // CD das magias: extraída do spell_description (ex: "CD 50")
  // cdoutros = CD - 10 - INT_mod - floor(level/2)
  const cdMatch = (monster.spell_description || '').match(/\bCD\s+(\d+)/i);
  if (cdMatch) {
    const cdTotal = parseInt(cdMatch[1]) || 0;
    const intMod = parseInt(attrVal('int')) || 0;
    data.cdoutros = String(cdTotal - 10 - intMod - Math.floor(monsterLevel / 2));
  }

  // Defesa: 10 + DES + outros  →  outros = total - 10 - DES
  const defenseTotal = parseInt(monster.defense || '0') || 0;
  data.defesaatributo = '1';
  data.defesaoutros = String(defenseTotal - 10 - desMod);

  const hasRangedAttack = (monster.attacks || []).some(
    (a) => a.type === 'à distância',
  );
  const hasMeleeAttack = (monster.attacks || []).some(
    (a) => a.type !== 'à distância',
  );

  // Perícias: inicializa todas com atributo correto, treinada=0 e outros=0
  Object.entries(SKILL_NAME_TO_FIELD).forEach(([, field]) => {
    data[`${field}_treinada`] = '0';
    data[`${field}atributo2`] = SKILL_ATTR_FORMULA[SKILL_ATTR_MAP[field]];
    data[`${field}outros`] = '0';
  });

  // Mapa de modificadores de atributo para reuso nas perícias
  const attrModMap = {
    for: forMod, des: desMod,
    con: parseInt(attrVal('con')) || 0,
    int: parseInt(attrVal('int')) || 0,
    sab: parseInt(attrVal('wis')) || 0,
    car: parseInt(attrVal('cha')) || 0,
  };

  // Luta: treinada se tiver ataques corpo a corpo
  if (hasMeleeAttack) {
    data['luta_treinada'] = '1';
    const meleeAttack = (monster.attacks || []).find(
      (a) => a.type !== 'à distância',
    );
    const bonusTotal = parseInt(meleeAttack?.bonus || '0') || 0;
    data['lutaoutros'] = String(
      calcSkillOutros({ bonusTotal, attrMod: forMod, level: monsterLevel, trained: true }),
    );
  }

  // Pontaria: treinada se tiver ataques à distância
  if (hasRangedAttack) {
    data['pontaria_treinada'] = '1';
    const rangedAttack = (monster.attacks || []).find(
      (a) => a.type === 'à distância',
    );
    const bonusTotal = parseInt(rangedAttack?.bonus || '0') || 0;
    data['pontariaoutros'] = String(
      calcSkillOutros({ bonusTotal, attrMod: desMod, level: monsterLevel, trained: true }),
    );
  }

  // Demais perícias do monstro: total = atributo_mod + treino + floor(level/2) + outros
  Object.entries(monster.skills || {}).forEach(([skillName, bonusStr]) => {
    const field = SKILL_NAME_TO_FIELD[skillName];
    if (!field || field === 'luta' || field === 'pontaria') return;
    const attrMod = attrModMap[SKILL_ATTR_MAP[field]] || 0;
    const bonusTotal = parseInt(bonusStr) || 0;
    data[`${field}_treinada`] = '1';
    data[`${field}outros`] = String(
      calcSkillOutros({ bonusTotal, attrMod, level: monsterLevel, trained: true }),
    );
  });

  // Fortitude, Reflexos, Vontade, Iniciativa, Percepção: campos diretos do monstro
  const saveMap = [
    { field: 'fortitude', monsterVal: monster.fort,       attrKey: 'con' },
    { field: 'reflexos',  monsterVal: monster.ref,        attrKey: 'des' },
    { field: 'vontade',   monsterVal: monster.von,        attrKey: 'sab' },
    { field: 'iniciativa', monsterVal: monster.initiative, attrKey: 'des' },
    { field: 'percepcao', monsterVal: monster.perception,  attrKey: 'sab' },
  ];
  saveMap.forEach(({ field, monsterVal, attrKey }) => {
    if (!monsterVal) return;
    const bonusTotal = parseInt(monsterVal) || 0;
    const attrMod = attrModMap[attrKey] || 0;
    data[`${field}_treinada`] = '1';
    data[`${field}outros`] = String(
      calcSkillOutros({ bonusTotal, attrMod, level: monsterLevel, trained: true }),
    );
  });

  // Ofício: campo especial com nome em oficionome e bônus baseado em INT
  const oficioSkills = Object.entries(monster.skills || {}).filter(
    ([name]) => name.toLowerCase().startsWith('ofício') || name.toLowerCase().startsWith('oficio'),
  );
  if (oficioSkills.length > 0) {
    const [[, bonusStr1], [, bonusStr2] = []] = oficioSkills;
    const intMod = attrModMap['int'] || 0;
    const offNames = oficioSkills.map(([name]) =>
      name.replace(/^ofício\s*/i, '').replace(/^oficio\s*/i, '').trim().replace(/^\(|\)$/g, '').trim(),
    );
    if (offNames[0]) {
      data['oficionome'] = offNames[0];
      data['oficio_treinada'] = '1';
      data['oficiooutros'] = String(calcSkillOutros({ bonusTotal: parseInt(bonusStr1) || 0, attrMod: intMod, level: monsterLevel, trained: true }));
    }
    if (offNames[1]) {
      data['oficio2nome'] = offNames[1];
      data['oficio2_treinada'] = '1';
      data['oficio2outros'] = String(calcSkillOutros({ bonusTotal: parseInt(bonusStr2) || 0, attrMod: intMod, level: monsterLevel, trained: true }));
    }
  }

  // Ataques: bonusataque = 0 (a ficha calcula via lutatotal/pontariatotal)
  // separator: '' = único/primeiro, 'e' = simultâneo, 'ou' = alternativo
  const attacks = monster.attacks || [];
  data.attacks = attacks.map((attack, idx) => {
    const isRanged = attack.type === 'à distância';
    const { dano, dadoExtra, critMult, critRange, alcance, descricao } = parseDamage(
      attack.damage || '',
    );

    // meleedescription = separator do PRÓXIMO ataque (exibido após este na ficha)
    // Único ou último do grupo → '' (sem conector)
    const nextSep = idx + 1 < attacks.length ? (attacks[idx + 1].separator || '') : '';

    return {
      nomeataque: attack.name || '',
      bonusataque: '0',
      danoataque: dano,
      danoextraataque: '0',
      dadoextraataque: dadoExtra,
      margemcriticoataque: critRange,
      multiplicadorcriticoataque: critMult,
      ataquedescricao: descricao,
      meleedescription: nextSep,
      ataquepericia: isRanged ? ATTACK_SKILL_RANGED : ATTACK_SKILL_MELEE,
      ataquetipodedano: '',
      ataquealcance: isRanged ? (attack.range || '') : alcance,
      modatributodano: '',
      tipocritico: '',
    };
  });

  // Habilidades especiais
  data.abilities = (monster.abilities || []).map((ab) => {
    const actionStr = ab.action ? ` (${ab.action})` : '';
    const magicStr = ab.is_magical ? ' [Mágica]' : '';
    return {
      nameability: `${ab.name}${actionStr}${magicStr}`,
      abilitydescription: ab.description || '',
    };
  });

  // Magias do monstro → spells1 (todas no círculo 1 por padrão)
  // spell_description (ex: "conjurador arcano de 20º nível") vai como habilidade de contexto
  if (monster.spell_description) {
    data.abilities.push({
      nameability: 'Magia',
      abilitydescription: monster.spell_description,
    });
  }
  data.spells1 = (monster.spells || []).map((s) => {
    // Montar nome completo: "Nome (Execução, X PM, Duração)"
    const parts = [];
    if (s.execucao) parts.push(s.execucao.charAt(0).toUpperCase() + s.execucao.slice(1));
    if (s.pm) parts.push(`${s.pm} PM`);
    if (s.duracao) parts.push(s.duracao.charAt(0).toUpperCase() + s.duracao.slice(1));
    const namespell = parts.length > 0
      ? `${s.name} (${parts.join(', ')})`
      : s.name || '';
    return {
      namespell,
      spelltipo: '',
      spellexecucao: s.execucao || '',
      spellalcance: '',
      spellduracao: s.duracao || '',
      spellalvoarea: '',
      spellresistencia: '',
      spelldescription: s.description || '',
      spellcd: '0',
    };
  });

  // Equipamentos
  data.equipments = (monster.equipment || []).map((item) => ({
    equipname: typeof item === 'string' ? item : (item.name || ''),
    equipslot: 1,
    equipquantity: '1',
    equipweight: '1',
    sobrevivencia_treinada: '0',
  }));

  data.powers = [];
  // spells1 já foi populado com as magias do monstro acima
  data.spells2 = [];
  data.spells3 = [];
  data.spells4 = [];
  data.spells5 = [];
  data.skills = [];

  return data;
}

// ---------------------------------------------------------------------------
// Dialog de confirmação e importação
// ---------------------------------------------------------------------------

/**
 * Abre dialog de confirmação para importar monstro na ficha ativa.
 *
 * @param {Object} props
 * @param {Object} props.monster
 * @param {ImportExportSheet} props.importExportSheet
 */
export function openMonsterImportDialog({ monster, importExportSheet }) {
  const dialogId = `tormenta20-monster-import-${monster.name.replace(/\s+/g, '-')}`;

  const successMessage = createElement('p', {
    classes: 'tormenta20-success-message',
  });
  const errorMessage = createElement('p', {
    classes: 'tormenta20-error-message',
  });
  const importButton = createElement('button', {
    classes: 'btn',
    innerHTML: 'Importar Monstro',
  });

  importButton.addEventListener('click', () => {
    try {
      errorMessage.textContent = '';
      successMessage.textContent = '';
      importButton.disabled = true;
      importButton.textContent = 'Importando...';

      const sheetData = monsterToSheetData(monster);
      importExportSheet.character.attribs.fetch({
        success: () => {
          importExportSheet.deleteOldData();
          importExportSheet.importNewData(sheetData);
          importButton.textContent = 'Importar Monstro';
          importButton.disabled = false;
          successMessage.textContent = 'Monstro importado com sucesso!';
        },
      });
    } catch (e) {
      errorMessage.textContent = 'Falha ao importar o monstro.';
      importButton.textContent = 'Importar Monstro';
      importButton.disabled = false;
      console.error({ e });
    }
  });

  openDialog({
    id: dialogId,
    title: `Importar "${monster.name}" para a ficha`,
    content: [
      createElement('div', {
        classes: 'tormenta20-import-content',
        append: [
          createElement('p', {
            innerHTML: `Isso vai substituir <b>todos os dados</b> da ficha pelos dados de <b>${monster.name}</b>.`,
          }),
          createElement('p', {
            innerHTML:
              '<b>Atenção</b>: Essa operação não pode ser desfeita.',
          }),
          successMessage,
          errorMessage,
          importButton,
        ],
      }),
    ],
  });
}