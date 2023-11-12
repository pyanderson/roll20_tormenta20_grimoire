# Grimório do Tormenta20 para o Roll20

Escolha magias, habilidade e poderes diretamente na sua ficha!

Consulte regras de combate, condições e perícias direto no Roll20!

Extensão para o Roll20 que auxilia na sua campanha de Tormenta20.
É adicionada a opção de escolher uma magia ou poder, sem necessidade de ficar copiando/escrevendo do livro. Também adiciona o cálculo automático de CD.
Um menu Lateral extra é adicionado na página pra consulta de regras de combate, condições e perícias.

### Aviso

Todo o conteúdo da pasta [src/data/](src/data/) está sob a licença [OPEN GAME LICENSE](OPEN_GAME_LICENSE).

Icons from [freepik](https://www.freepik.com).

## Instalação

Visite a página da loja de extensões do seu navegador:

- [Chrome](https://chrome.google.com/webstore/detail/roll20-grim%C3%B3rio-do-tormen/lplnbanhibpehlmiiakcacambjleeeng)

- [Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/roll20-grim%C3%B3rio-do-tormenta20/)

## Roadmap

- [x] Magias direto na ficha _[v0.0.2]_
- [x] Compatibilidade com Firefox _[v0.0.3]_
- [x] Menu lateral de regras _[v0.0.4]_
- [x] Combate _[v0.0.4]_
- [x] Condições _[v0.0.4]_
- [x] Perícias _[v0.0.4]_
- [x] Remoção de permissões desnecessárias _[v0.0.5]_
- [x] Poderes de classes (Ficha) _[v0.0.8]_
- [x] Poderes de origens (Ficha) _[v0.0.8]_
- [x] Poderes gerais (Ficha) _[v0.0.8]_
- [x] Equipamento (Menu Lateral) _[v0.0.10]_
- [x] Versão parcial do Jogo do Ano e subtistuição do menu lateral por um botão que abre o Grimório _[v0.3.0]_
- [x] Jogo do Ano _[v0.3.1]_
- [x] Condições clicáveis no chat _[v0.4.0]_
- [x] Busca _[v0.4.2]_
- [x] Poderes de classes (Grimório) _[v0.4.3]_
- [x] Poderes de origens (Grimório) _[v0.4.3]_
- [x] Poderes gerais (Grimório) _[v0.4.3]_
- [x] Equipamento (Ficha) _[v0.4.4]_
- [x] Autocomplete para raças (Ficha) _[v0.4.5]_
- [x] Tormenta20 Game of the Year - Suporte para a ficha do jogo do ano. _[v0.4.8]_
- [x] Habilidades de raças adicionadas automaticamente. _[v0.4.11]_
- [x] Tamanho e deslocamento atualizados automaticamente na versão jogo do ano da ficha. _[v0.4.12]_
- [x] Origens (Grimório) _[v0.4.14]_
- [x] Suporte para arrastar e soltar na ficha para raças, classes, poderes, equipamento e magias. _[v0.6.0]_
- [ ] Divindades (Grimório)
- [ ] Bestiário?
- [ ] ??????

## FAQ

### Qual versão do livro está sendo usada?

Versão Jogo do Ano, mais precisamente a 3ª edição lançada.

### Quais templates de fichas a extensão tem suporte?

Para os templates `Tormenta 20` e `Tormenta20 Game of the Year`.

### Como posso contribuir?

Sugestões e feedbacks sempre são bem vindos, você pode usar as [issues](https://github.com/pyanderson/roll20_tormenta20_grimoire/issues) para isso.

Se você já possui alguma experiência com git e github e quer ajudar a manter o conteúdo atualizado pode abrir um Pull Request atualizando alguma magia, habilidade, poder, etc.

### Como funciona o Roadmap? Existe algum prazo?

Conforme as ideias surgem ou recebo sugestões, elas são adicionadas no Roadmap, então não necessariamente ele será executado na ordem que aparece, mas as ideias e sugestões da comunidade influenciam bastante na ordem que as coisas serão feitas.

Como esse é um projeto que estou mantendo no meu tempo livre não é possível determinar prazos.

### Como os dados são gerados?

Os dados são extraídos do livro através de scripts e interações manuais. Mais detalhes em [data-generator](/data/generator/README.md).

## Desenvolvendo

### Dependências

- Instale o [node v18.18.2](https://nodejs.org/en/download)

Então instale os pacotes:

```bash
npm i
```

### Build

O firefox não tem suporte para a versão 3 do manifest, por isso é necessário ter as duas versões disponíveis, sendo assim, tem dois comandos para gerar o bundle em desenvolvimento.

- v2

```bash
npm run build:dev:v2
```

- v3

```bash
npm run build:dev
```

Os arquivos da extensão serão gerados na pasta `dist/`.

### Chrome

Para testar no chrome você vai precisar carregar uma extensão sem compactação, veja mais detalhes [aqui](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked).

### Firefox

Para testar no firefox você vai precisar carregar uma extensão temporária, veja mais detalhes [aqui](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing).

### Content scripts

Essa extensão usa content scripts por que precisa acessar diretamente os recursos da página. Você pode verificar mais detalhes nas documentações oficiais:

- [Chrome](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts)

Isso significa que a extensão é executada em um "mundo isolado", sem acesso a recursos importantes, como a API interna do Roll20, por isso, é utilizada uma técnica de injeção de script para conseguir acessar esses recursos. Mas existe uma contrapartida, temos que aceitar as limitações e uma certa imprevisibilidade da aplicação Roll20, por exemplo, no momento a versão jQuery utilizada é a 1.9.1, e não temos controle sobre isso, a qualquer momento eles podem atualizar para uma versão incompatível com algo que está sendo utilizado por essa extensão, embora seja improvável grandes mudanças do tipo, essa é uma opção factível.

Sendo assim, o uso de jQuery é o mínimo possível, se limitando à casos que se precisa de compatibilidade de layout com o Roll20 (diálogos).

### Documentação

As funções estão documentadas usando [JSDoc](https://jsdoc.app/), sem nenhuma razão específica só por que eu queria testar mesmo :D (é provavel que eu mude para typescript e essa documentação talvez não faça tanto sentido). Para gerar a Documentação, siga os passos:

- Instale o [Node](https://github.com/nodejs/node/tree/main#download) caso não tenha ainda. Recomendo instalar via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

Instale as dependências:

```bash
npm i
```

Gere a Documentação:

```bash
npm run docs
```

A documentação será gerada na pasta `out`, seguindo o seguinte padrão: `out/roll20_tormenta20_grimoire/{versão-atual}/index.html`
