# Data Generator

Os dados são gerados em um processo semi-automático, onde o pdf é convertido para texto e então é feito um processamento em cima desses dados com etapas automáticas e manuais:

![Overview Process](/data-generator/overview.png)

## Dependências

- [poppler-utils](https://packages.debian.org/sid/poppler-utils)
- [python](https://www.python.org/downloads/)

## Generate Raw Data

O script [generate_raw_data.py](/data-generator/generate_raw_data.py) é responsável por essa etapa, ele vai executar o commando `pdftotext` no trecho do livro especificado e tentar formatar o texto em blocos de informações, o conteúdo ainda estará no formato de texto, mas ele estará divido no seguinte formato:

```
{name 1}
{paragraph 1}
{paragraph 2}
...
{paragraph n}

{name 2}
{paragraph 1}
{paragraph 2}
...
{paragraph n}
```

### generate_raw_data.py

```bash
python data-generator/generate_raw_data.py caminho-para-o-pdf primeira-página ultima-página caminho-para-o-txt
```

## Fix Raw Data

O script anterior não é perfeito, até por que o texto do livro não tem uma estrtura bem determinada, por causa das imagens, tabelas e outros detalhes das páginas, então muitas vezes alguns blocos não irão ficar na formatação esperada, por exemplo, se você executar esse comando:

```bash
python data-generator/generate_raw_data.py livro.pdf 91 91 data-generator/raw.txt
```

A origem `Àmigo dos Animais` estará na seguinte forma:

```
Amigo dos Animais
Você pode ter sido cavalariço no estábulo de um castelo, criador de gado em uma fazenda, ginete de Namalkah ou mesmo tratador em um zoológico ou circo — em Arton, existem espetáculos circenses com animais em jaulas, que talvez você tenha desejado libertar. Ou então nada disso: desde criança você tem facilidade em lidar com animais, sempre conversou com eles, sentiu ser capaz de compreendê-los. Em certos lugares ou tribos, alguma montaria especial seria destinada a você.
Itens. Cão de caça, cavalo, pônei ou trobo (escolha um). Benefícios. Adestramento, Cavalgar (perícias); Amigo Especial (poder).
```

Como você pode ver, `Itens` e `Benefícios` estão no mesmo parágrafo, então você vai precisar corrigir esse caso e outros semelhantes no arquivo. Então o texto anterior deve ficar assim:

```
Amigo dos Animais
Você pode ter sido cavalariço no estábulo de um castelo, criador de gado em uma fazenda, ginete de Namalkah ou mesmo tratador em um zoológico ou circo — em Arton, existem espetáculos circenses com animais em jaulas, que talvez você tenha desejado libertar. Ou então nada disso: desde criança você tem facilidade em lidar com animais, sempre conversou com eles, sentiu ser capaz de compreendê-los. Em certos lugares ou tribos, alguma montaria especial seria destinada a você.
Itens. Cão de caça, cavalo, pônei ou trobo (escolha um).
Benefícios. Adestramento, Cavalgar (perícias); Amigo Especial (poder).
```

Além disso é preciso remover tabelas, descrições de imagens e qualquer outro detalhe que não faça parte do texto e que o script anterior não detectou.

## Generate Book Items

Esse script é simples, ele vai processar os blocos de informações e gerar um json no formato que é esperado para os items do livro que estão na extensão.

### generate_book_items.py

```bash
python data-generator/generate_book_items.py caminho-para-o-txt caminho-para-o-json
```

## Organization

Com os dados gerados, agora é preciso copiar/recortar para a pasta [data](/data/), é o processo mais customizados de todos, por que vai depender de quais dados você está movendo, mas tende a ser simples também.

