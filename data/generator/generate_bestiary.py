import re
import json
import sys
from collections import defaultdict

ATTRS_LINE_RE = re.compile(
    r'FOR\s+([-\d]+)[,\s]+DES\s+([-\d]+)[,\s]+CON\s+([-\d]+)[,\s]+'
    r'INT\s+([-\d]+)[,\s]+SAB\s+([-\d]+)[,\s]+CAR\s+([-\d]+)',
    re.IGNORECASE,
)
ND_RE = re.compile(r'\bND\s+([\w/]+)', re.IGNORECASE)
TYPE_LINE_RE = re.compile(
    r'^(Monstro|Animal|Construto|Espírito|Morto-?vivo|Humanoide|Planta|Fada|Dragão)',
    re.IGNORECASE,
)
ROLE_MAP = {'solo': 'Solo', 'lacaio': 'Lacaio', 'especial': 'Especial'}
FIXED_FIELD_PREFIXES = [
    'INICIATIVA', 'DEFESA', 'PONTOS DE VIDA', 'DESLOCAMENTO',
    'PONTOS DE MANA', 'CORPO A CORPO', 'À DISTÂNCIA', 'ATAQUE ESPECIAL',
    'MAGIA', 'PERÍCIAS', 'EQUIPAMENTO', 'TESOURO',  # EQUIPAMENTO adicionado
]


def split_blocks(text):
    blocks, current = [], []
    for line in text.splitlines():
        if line.strip() == '':
            if current:
                blocks.append('\n'.join(current))
                current = []
        else:
            current.append(line)
    if current:
        blocks.append('\n'.join(current))
    return [b for b in blocks if b.strip()]


def parse_name_and_nd(line):
    nd_match = ND_RE.search(line)
    nd = nd_match.group(1) if nd_match else ''
    name = ND_RE.sub('', line).strip()
    return name.strip(), nd.strip()


def parse_type_line(line):
    role = ''
    role_match = re.search(r'\[(solo|lacaio|especial)\]', line, re.IGNORECASE)
    if role_match:
        role = ROLE_MAP.get(role_match.group(1).lower(), '')
        line = line[:role_match.start()].strip()
    subtype_match = re.search(r'\(([^)]+)\)', line)
    subtype = subtype_match.group(1) if subtype_match else ''
    line_clean = re.sub(r'\([^)]+\)', '', line).strip()
    parts = line_clean.split()
    return (parts[0] if parts else ''), subtype, (parts[-1] if len(parts) > 1 else ''), role


def parse_attributes(line):
    m = ATTRS_LINE_RE.search(line)
    if not m:
        return {}
    keys = ['str','dex','con','int','wis','cha']
    def to_int(v):
        try: return int(v)
        except: return None
    return {k: to_int(v) for k, v in zip(keys, m.groups())}


def parse_initiative_line(line):
    initiative, perception, other_perception = '', '', []
    m = re.search(r'INICIATIVA\s*([-+]\d+)', line, re.IGNORECASE)
    if m:
        initiative = m.group(1)
    m2 = re.search(r'PERCEP[ÇC][ÃA]O\s*([-+]\d+)', line, re.IGNORECASE)
    if m2:
        perception = m2.group(1)
    rest = re.sub(r'INICIATIVA\s*[-+]\d+', '', line, flags=re.IGNORECASE)
    rest = re.sub(r'PERCEP[ÇC][ÃA]O\s*[-+]\d+', '', rest, flags=re.IGNORECASE)
    rest = re.sub(r'^[\s,]+', '', rest).strip().rstrip('.')
    if rest:
        other_perception = [i.strip() for i in rest.split(',') if i.strip()]
    return initiative, perception, other_perception


def parse_defense_line(line):
    text = re.sub(r'^DEFESA\s*', '', line, flags=re.IGNORECASE).strip()
    result = {
        'defense': '', 'fort': '', 'ref': '', 'von': '',
        'immunities': [], 'damage_reduction': {}, 'resistances': [], 'vulnerabilities': [],
    }
    m = re.match(r'^(\d+)', text)
    if m:
        result['defense'] = m.group(1)
    for key, pat in [('fort', r'Fort\s*([-+]\d+)'), ('ref', r'Ref\s*([-+]\d+)'), ('von', r'Von\s*([-+]\d+)')]:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            result[key] = m.group(1)
    imm = re.search(r'imunidade a ([^,;\.]+)', text, re.IGNORECASE)
    if imm:
        result['immunities'] = [i.strip() for i in re.split(r'\s+e\s+|,', imm.group(1)) if i.strip()]
    for val, tipo in re.findall(r'redu[çc][aã]o de dano\s+(\d+)(?:/([\w]+))?', text, re.IGNORECASE):
        result['damage_reduction'][tipo if tipo else 'normal'] = int(val)
    for elementos, val in re.findall(
        r'redu[çc][aã]o de ([a-záéíóúâêîôûãõàç]+(?: e [a-záéíóúâêîôûãõàç]+)*)\s+(\d+)',
        text, re.IGNORECASE,
    ):
        for elem in re.split(r'\s+e\s+', elementos):
            elem = elem.strip()
            if elem.lower() != 'dano':
                result['damage_reduction'][elem] = int(val)
    for alvo, bonus in re.findall(r'resist[eê]ncia (?:a |à )?([^,;\.]+?)\s*([-+]\d+)', text, re.IGNORECASE):
        result['resistances'].append({'to': alvo.strip(), 'bonus': bonus})
    vuln = re.search(r'vulnerabilidade a ([^,;\.]+)', text, re.IGNORECASE)
    if vuln:
        result['vulnerabilities'] = [i.strip() for i in re.split(r'\s+e\s+|,', vuln.group(1)) if i.strip()]
    return result


def parse_skills(text):
    text = re.sub(r'^PERÍCIAS\s*', '', text, flags=re.IGNORECASE).strip().rstrip('.')
    skills = {}
    for part in text.split(','):
        part = part.strip()
        m = re.match(r'^(.+?)\s+([-+]\d+)$', part)
        if m:
            skills[m.group(1).strip()] = m.group(2)
    return skills


def parse_equipment(text):
    text = re.sub(r'^EQUIPAMENTO\s*', '', text, flags=re.IGNORECASE).strip().rstrip('.')
    return [item.strip() for item in text.split(',') if item.strip()]


def parse_attacks(line):
    attack_type = 'à distância' if line.upper().startswith('À DISTÂNCIA') else 'corpo a corpo'
    text = re.sub(r'^(CORPO A CORPO|À DISTÂNCIA|ATAQUE ESPECIAL)\s*', '', line, flags=re.IGNORECASE).strip().rstrip('.')
    # Divide preservando o separador entre ataques (fora dos parênteses de dano)
    # re.split com grupo capturante retorna: [parte0, sep1, parte1, sep2, parte2, ...]
    tokens = re.split(r'\)\s*(,\s*|\s+e\s+|\s+ou\s+)(?=\S)', text)
    groups = []  # [(separator, texto), ...]
    for i, tok in enumerate(tokens):
        if i == 0:
            groups.append(('', tok + ')'))
        elif i % 2 == 1:
            raw_sep = tok.strip().rstrip(',').strip()
            sep = raw_sep if raw_sep == 'ou' else 'e'  # vírgula e 'e' → 'e'
        else:
            groups.append((sep, tok + ')'))
    attacks = []
    for sep, part in groups:
        part = part.strip()
        m = re.match(r'^(.+?)\s+([-+]\d+(?:/[-+]\d+)?)\s+\(([^)]+)\)', part)
        if m:
            attacks.append({
                'name': m.group(1).strip().capitalize(),
                'bonus': m.group(2),
                'damage': m.group(3),
                'type': attack_type,
                'separator': sep,  # '' = primeiro/único, 'e' = simultâneo, 'ou' = alternativo
            })
        elif part.rstrip(')').strip():
            attacks.append({'name': part.rstrip(')').strip().capitalize(), 'bonus': '', 'damage': '', 'type': attack_type, 'separator': sep})
    return attacks


def is_fixed_field(line):
    upper = line.upper()
    return any(upper.startswith(p) for p in FIXED_FIELD_PREFIXES)


def is_ability_line(line):
    if line.startswith('•') or ATTRS_LINE_RE.match(line) or is_fixed_field(line):
        return False
    first_word = line.split()[0] if line.split() else ''
    letters = [c for c in first_word if c.isalpha()]
    return bool(letters) and all(c == c.upper() for c in letters)


def parse_ability(line):
    is_magical = bool(re.search(r'\[magico\]', line, re.IGNORECASE))
    line_clean = re.sub(r'\s+', ' ', re.sub(r'\[magico\]', '', line, flags=re.IGNORECASE)).strip()
    # Prioridade 1: formato com ':' — 'NOME: desc' ou 'NOME (ação): desc'
    m = re.match(r'^([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÀÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÀÇ\s\-]*?)(?:\s*\(([^)]+)\))?\s*:\s*(.+)$', line_clean, re.DOTALL)
    if m:
        return {'name': m.group(1).strip().title(), 'action': (m.group(2) or '').strip(), 'is_magical': is_magical, 'description': m.group(3).strip()}
    # Fallback: 'NOME (ação) descrição'
    m2 = re.match(r'^((?:[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÀÇ\-]+(?:\s+|$))+)\(([^)]+)\)\s*(.+)$', line_clean, re.DOTALL)
    if m2:
        return {'name': m2.group(1).strip().title(), 'action': m2.group(2).strip(), 'is_magical': is_magical, 'description': m2.group(3).strip()}
    # Fallback: 'NOME descrição'
    m3 = re.match(r'^((?:[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÀÇ\-]+(?:\s+|$))+)([A-Za-záéíóúâêîôûãõàç].+)$', line_clean, re.DOTALL)
    if m3:
        return {'name': m3.group(1).strip().title(), 'action': '', 'is_magical': is_magical, 'description': m3.group(2).strip()}
    return {'name': line_clean.title(), 'action': '', 'is_magical': is_magical, 'description': ''}


def parse_spell_bullet(line):
    line = line.lstrip('•').strip()
    # Formato novo: NOME (EXECUÇÃO, X PM[, DURAÇÃO]): descrição
    m = re.match(r'^(.+?)\s+\(([^)]+)\)\s*:\s*(.+)$', line, re.DOTALL)
    if not m:
        # Fallback sem ':'
        m = re.match(r'^(.+?)\s+\(([^)]+)\)\s+(.+)$', line, re.DOTALL)
    if m:
        name = m.group(1).strip().title()
        cost_str = m.group(2).strip()
        description = m.group(3).strip()
        parts = [p.strip() for p in cost_str.split(',')]
        execucao = parts[0].lower() if parts else ''
        pm_match = re.search(r'(\d+)\s*PM', cost_str, re.IGNORECASE)
        pm = pm_match.group(1) if pm_match else ''
        # Duração: última parte se tiver 3+ partes e não for número de PM
        duracao = parts[-1].strip().lower() if len(parts) >= 3 and not re.match(r'\d+\s*pm', parts[-1], re.IGNORECASE) else ''
        return {'name': name, 'cost': cost_str, 'execucao': execucao, 'pm': pm, 'duracao': duracao, 'description': description}
    return {'name': line, 'cost': '', 'execucao': '', 'pm': '', 'duracao': '', 'description': ''}


def parse_monster_block(block):
    lines = [l for l in block.strip().splitlines() if l.strip()]
    if not lines:
        return None

    monster = {
        'name': '', 'nd': '', 'type': '', 'subtype': '', 'size': '', 'role': '',
        'initiative': '', 'perception': '', 'other_perception': [],
        'defense': '', 'fort': '', 'ref': '', 'von': '',
        'immunities': [], 'damage_reduction': {}, 'resistances': [], 'vulnerabilities': [],
        'hp': 0, 'movement': '', 'pm': 0,
        'attacks': [], 'spell_description': '', 'spells': [],
        'abilities': [], 'attributes': {}, 'skills': {},
        'equipment': [], 'treasure': '', 'description': '',
    }

    monster['name'], monster['nd'] = parse_name_and_nd(lines[0])
    idx = 1
    if idx < len(lines) and TYPE_LINE_RE.match(lines[idx].strip()):
        ctype, subtype, size, role = parse_type_line(lines[idx])
        monster.update({'type': ctype, 'subtype': subtype, 'size': size, 'role': role})
        idx += 1

    merged = []
    for line in lines[idx:]:
        s = line.strip()
        if not s:
            continue
        is_new = is_fixed_field(s) or s.startswith('•') or is_ability_line(s) or ATTRS_LINE_RE.match(s)
        if is_new or not merged:
            merged.append(s)
        else:
            merged[-1] += ' ' + s

    for line in merged:
        upper = line.upper()
        if ATTRS_LINE_RE.match(line):
            monster['attributes'] = parse_attributes(line)
        elif upper.startswith('INICIATIVA'):
            ini, perc, other = parse_initiative_line(line)
            monster['initiative'] = ini
            monster['perception'] = perc
            monster['other_perception'] = other
        elif upper.startswith('DEFESA'):
            monster.update(parse_defense_line(line))
        elif upper.startswith('PONTOS DE VIDA'):
            m = re.search(r'(\d+)', line)
            if m: monster['hp'] = int(m.group(1))
        elif upper.startswith('DESLOCAMENTO'):
            monster['movement'] = re.sub(r'^DESLOCAMENTO\s*', '', line, flags=re.IGNORECASE).strip()
        elif upper.startswith('PONTOS DE MANA'):
            m = re.search(r'(\d+)', line)
            if m: monster['pm'] = int(m.group(1))
        elif upper.startswith('CORPO A CORPO') or upper.startswith('À DISTÂNCIA'):
            monster['attacks'].extend(parse_attacks(line))
        elif upper.startswith('MAGIA'):
            monster['spell_description'] = re.sub(r'^MAGIA\s*:?\s*', '', line, flags=re.IGNORECASE).strip()
        elif line.startswith('•'):
            monster['spells'].append(parse_spell_bullet(line))
        elif upper.startswith('PERÍCIAS'):
            monster['skills'] = parse_skills(line)
        elif upper.startswith('EQUIPAMENTO'):
            monster['equipment'] = parse_equipment(line)
        elif upper.startswith('TESOURO'):
            monster['treasure'] = re.sub(r'^TESOURO\s*', '', line, flags=re.IGNORECASE).strip()
        elif is_ability_line(line):
            monster['abilities'].append(parse_ability(line))
        else:
            monster['description'] += (' ' + line) if monster['description'] else line

    return monster


def build_description(m):
    parts = []
    role_str = f' [{m["role"]}]' if m['role'] else ''
    subtype_str = f' ({m["subtype"]})' if m['subtype'] else ''
    type_line = f'{m["type"]}{subtype_str} {m["size"]}{role_str}'.strip()
    if type_line:
        parts.append(f'Tipo: {type_line}')
    parts.append(f'ND: {m["nd"]}')

    stat_parts = []
    if m['initiative']: stat_parts.append(f'Iniciativa: {m["initiative"]}')
    if m['perception']: stat_parts.append(f'Percepção: {m["perception"]}')
    if m['other_perception']: stat_parts.append(', '.join(m['other_perception']))
    if stat_parts: parts.append(' | '.join(stat_parts))

    def_parts = []
    if m['defense']: def_parts.append(f'Defesa: {m["defense"]}')
    if m['fort']: def_parts.append(f'Fort: {m["fort"]}')
    if m['ref']: def_parts.append(f'Ref: {m["ref"]}')
    if m['von']: def_parts.append(f'Von: {m["von"]}')
    if def_parts: parts.append(' | '.join(def_parts))

    if m['immunities']: parts.append(f'Imunidades: {", ".join(m["immunities"])}')
    if m['damage_reduction']:
        rd = [f'RD {v} ({k})' if k != 'normal' else f'RD {v}' for k, v in m['damage_reduction'].items()]
        parts.append(f'Redução de Dano: {", ".join(rd)}')
    if m['resistances']:
        parts.append(f'Resistências: {", ".join(r["to"] + " " + r["bonus"] for r in m["resistances"])}')
    if m['vulnerabilities']: parts.append(f'Vulnerabilidades: {", ".join(m["vulnerabilities"])}')

    if m['hp']: parts.append(f'PV: {m["hp"]}')
    if m['movement']: parts.append(f'Deslocamento: {m["movement"]}')
    if m['pm']: parts.append(f'PM: {m["pm"]}')

    if m['attacks']:
        # Agrupar por tipo e reconstruir no formato do livro:
        # Corpo a Corpo: Espada +15 (1d8+15) e Garra +15 (1d8+10).
        # À Distância: Arco +11 (1d8+6, x3).
        melee = [a for a in m['attacks'] if a['type'] != 'à distância']
        ranged = [a for a in m['attacks'] if a['type'] == 'à distância']
        attack_lines = []
        for label, group in [('Corpo a Corpo', melee), ('À Distância', ranged)]:
            if not group:
                continue
            tokens = []
            for i, a in enumerate(group):
                dmg = f', {a["damage"]}' if a['damage'] else ''
                token = f'{a["name"]} {a["bonus"]} (1d{dmg})' if not a['damage'] else f'{a["name"]} {a["bonus"]} ({a["damage"]})'
                sep = a.get('separator', '')
                if i == 0:
                    tokens.append(token)
                else:
                    tokens.append(f'{sep} {token}' if sep else token)
            attack_lines.append(f'{label}: {" ".join(tokens)}.')
        parts.append('\n\n'.join(attack_lines))

    if m['spell_description'] or m['spells']:
        spell_parts = []
        if m['spell_description']:
            spell_parts.append(m['spell_description'])
        for s in m['spells']:
            pm = f', {s["pm"]} PM' if s.get('pm') else ''
            dur = f', {s["duracao"].capitalize()}' if s.get('duracao') else ''
            cost = f' ({s["execucao"].capitalize()}{pm}{dur})' if s.get('execucao') or s.get('pm') else (f' ({s["cost"]})' if s.get('cost') else '')
            spell_parts.append(f'• {s["name"]}{cost}: {s["description"]}')
        parts.append('Magia:\n\n' + '\n\n'.join(spell_parts))

    if m['abilities']:
        ab_lines = []
        for ab in m['abilities']:
            action = f' ({ab["action"]})' if ab['action'] else ''
            magic = ' [Mágica]' if ab['is_magical'] else ''
            ab_lines.append(f'• {ab["name"]}{action}{magic}: {ab["description"]}')
        parts.append('Habilidades Especiais:\n\n' + '\n\n'.join(ab_lines))

    if m['attributes']:
        am = {'str':'FOR','dex':'DES','con':'CON','int':'INT','wis':'SAB','cha':'CAR'}
        parts.append('Atributos: ' + ' | '.join(f'{am[k]} {v if v is not None else "--"}' for k, v in m['attributes'].items()))

    if m['skills']: parts.append(f'Perícias: {", ".join(f"{k} {v}" for k, v in m["skills"].items())}')
    if m['equipment']: parts.append(f'Equipamento: {", ".join(m["equipment"])}')
    if m['treasure']: parts.append(f'Tesouro: {m["treasure"]}')
    if m['description']: parts.append(m['description'])

    return '\n\n'.join(parts)


def nd_sort_key(nd):
    nd = str(nd)
    if '/' in nd:
        a, b = nd.split('/')
        return int(a) / int(b)
    try:
        return float(nd)
    except ValueError:
        return 999


def monsters_to_book_folder(monsters):
    groups = defaultdict(list)
    for m in monsters:
        groups[m['nd']].append(m)
    sorted_nds = sorted(groups.keys(), key=nd_sort_key)
    return {
        'type': 'folder',
        'name': 'Bestiário',
        'items': [
            {
                'type': 'folder',
                'name': f'ND {nd}',
                'items': [
                    {'type': 'item', 'name': m['name'], 'description': build_description(m), '_monster': m}
                    for m in sorted(groups[nd], key=lambda x: x['name'])
                ],
            }
            for nd in sorted_nds
        ],
    }


def main():
    if len(sys.argv) < 3:
        print('Uso: python generate_bestiary.py entrada.txt saida.json')
        sys.exit(1)
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        text = f.read()
    blocks = split_blocks(text)
    print(f'{len(blocks)} blocos encontrados.')
    monsters, errors = [], 0
    for i, block in enumerate(blocks):
        try:
            monster = parse_monster_block(block)
            if monster and monster['name']:
                monsters.append(monster)
            else:
                print(f'[AVISO] Bloco {i+1} ignorado: {block[:60]}...')
        except Exception as e:
            errors += 1
            print(f'[ERRO] Bloco {i+1}: {e}\n  {block[:80]}')
    print(f'{len(monsters)} monstros parseados. {errors} erro(s).')
    result = monsters_to_book_folder(monsters)
    with open(sys.argv[2], 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f'\nJSON salvo em: {sys.argv[2]}')
    for folder in result['items']:
        print(f'  {folder["name"]}: {len(folder["items"])} monstro(s)')


if __name__ == '__main__':
    main()