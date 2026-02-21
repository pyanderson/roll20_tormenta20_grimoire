'use strict';

// ---------------------------------------------------------------------------
// TODO - Implementar Futuramente
// ---------------------------------------------------------------------------
// [ ] ataquealcance para ataques à distância (depende da arma do monstro)
// [ ] somar no dano e ataque melhorias e encantamentos
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
 * Ex: "2d8+18 mais 2d6 fogo, x3" → { dano: "2d8+18", dadoExtra: "2d6", critMult: "3", critRange: "20" }
 * Ex: "2d6+8 mais veneno"        → { dano: "2d6+8",  dadoExtra: "",    critMult: "2", critRange: "20" }
 * Texto puro após "mais" (veneno, doença) é ignorado — já aparece nas habilidades.
 */
function parseDamage(damageStr) {
  let s = (damageStr || '').trim();

  // Multiplicador crítico: ", x3"
  let critMult = '2';
  const critMultMatch = s.match(/,\s*[xX](\d+)/);
  if (critMultMatch) {
    critMult = critMultMatch[1];
    s = s.slice(0, critMultMatch.index).trim();
  }

  // Margem crítica: ", 18" ou ", 19" (2 dígitos soltos no final)
  let critRange = '20';
  const critRangeMatch = s.match(/,\s*(\d{2})\s*$/);
  if (critRangeMatch) {
    critRange = critRangeMatch[1];
    s = s.slice(0, critRangeMatch.index).trim();
  }

  // Dano extra: " mais <dado>" — só registra se for expressão de dado válida
  let dadoExtra = '';
  const maisMatch = s.match(/\s+mais\s+(.+)$/i);
  if (maisMatch) {
    const extraStr = maisMatch[1].trim();
    s = s.slice(0, maisMatch.index).trim();
    const dadoMatch = extraStr.match(/^(\d*d\d+(?:[+\-]\d+)?)/);
    if (dadoMatch) {
      dadoExtra = dadoMatch[1]; // ex: "2d6" (sem texto de tipo de dano)
    }
  }

  return { dano: s, dadoExtra, critMult, critRange };
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

  // PV e PM
  data.vidatotal = String(monster.hp || 0);
  data.vida = String(monster.hp || 0);
  data.vidatemp = '0';
  data.manatotal = String(monster.pm || 0);
  data.mana = String(monster.pm || 0);
  data.manatemp = '0';

  // Defesa calculada após desMod (ver abaixo)

  // Deslocamento (primeiro valor em metros)
  const movMatch = (monster.movement || '').match(/(\d+)m/);
  data.deslocamento = movMatch ? movMatch[1] : '9';

  // Tamanho
  data.tamanho = String(SIZE_MAP[monster.size] ?? 0);

  // Notas com dados do monstro
  const roleStr = monster.role ? ` [${monster.role}]` : '';
  const subtypeStr = monster.subtype ? ` (${monster.subtype})` : '';
  const noteLines = [
    `${monster.type}${subtypeStr} ${monster.size}${roleStr}`,
    `ND: ${monster.nd}`,
  ];
  if (monster.initiative) noteLines.push(`Iniciativa: ${monster.initiative}`);
  if (monster.perception) noteLines.push(`Percepção: ${monster.perception}`);
  if ((monster.other_perception || []).length)
    noteLines.push(monster.other_perception.join(', '));
  if (monster.fort)
    noteLines.push(`Fort: ${monster.fort} | Ref: ${monster.ref} | Von: ${monster.von}`);
  if ((monster.immunities || []).length)
    noteLines.push(`Imunidades: ${monster.immunities.join(', ')}`);
  if (Object.keys(monster.damage_reduction || {}).length) {
    const rdStr = Object.entries(monster.damage_reduction)
      .map(([k, v]) => (k === 'normal' ? `${v}` : `${v}/${k}`))
      .join(', ');
    noteLines.push(`RD: ${rdStr}`);
  }
  if ((monster.vulnerabilities || []).length)
    noteLines.push(`Vulnerabilidades: ${monster.vulnerabilities.join(', ')}`);
  if (monster.treasure) noteLines.push(`\nTesouro: ${monster.treasure}`);
  data.charnotes = noteLines.join('\n');

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

  // Nível equivalente e bônus de treino baseados na ND
  const monsterLevel = ndToLevel(monster.nd);
  const forMod = parseInt(attrVal('str')) || 0;
  const desMod = parseInt(attrVal('dex')) || 0;

  // Defesa: 10 + DES + outros  →  outros = total - 10 - DES
  const defenseTotal = parseInt(monster.defense || '0') || 0;
  data.defesaatributo = '1'; // usa modificador de DES
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

  // Ataques: bonusataque = 0 (a ficha calcula via lutatotal/pontariatotal)
  data.attacks = (monster.attacks || []).map((attack) => {
    const isRanged = attack.type === 'à distância';
    const { dano, dadoExtra, critMult, critRange } = parseDamage(
      attack.damage || '',
    );
    return {
      nomeataque: attack.name || '',
      bonusataque: '0',
      danoataque: dano,
      danoextraataque: '0',
      dadoextraataque: dadoExtra,
      margemcriticoataque: critRange,
      multiplicadorcriticoataque: critMult,
      ataquedescricao: '',
      ataquepericia: isRanged ? ATTACK_SKILL_RANGED : ATTACK_SKILL_MELEE,
      ataquetipodedano: '',
      ataquealcance: isRanged ? '' : '1,5m',
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

  // Magias do monstro → habilidade extra
  if (monster.spell_description || (monster.spells || []).length > 0) {
    const spellLines = [];
    if (monster.spell_description) spellLines.push(monster.spell_description);
    (monster.spells || []).forEach((s) => {
      const cost = s.cost ? ` (${s.cost})` : '';
      spellLines.push(`${s.name}${cost}: ${s.description}`);
    });
    data.abilities.push({
      nameability: 'Magia',
      abilitydescription: spellLines.join('\n'),
    });
  }

  // Equipamentos
  data.equipments = (monster.equipment || []).map((item) => ({
    equipname: typeof item === 'string' ? item : (item.name || ''),
    equipslot: 1,
    equipquantity: '1',
    equipweight: '1',
    sobrevivencia_treinada: '0',
  }));

  data.powers = [];
  data.spells1 = [];
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