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
- [x] Menu de regras _[v0.0.4]_
- [x] Regras de combate _[v0.0.4]_
- [x] Regras de condições _[v0.0.4]_
- [x] Regras de perícias _[v0.0.4]_
- [x] Remover permissões desnecessárias _[v0.0.5]_
- [x] Poderes de classes (Ficha) _[v0.0.8]_
- [x] Poderes de origens (Ficha) _[v0.0.8]_
- [x] Poderes gerais (Ficha) _[v0.0.8]_
- [x] Equipamento (Menu Lateral) _[v0.0.10]_
- [ ] Jogo do Ano
- [ ] Poderes de classes (Menu Lateral)
- [ ] Poderes de origens (Menu Lateral)
- [ ] Poderes gerais (Menu Lateral)
- [ ] Equipamento (Ficha)
- [ ] Busca (Menu Lateral)
- [ ] Bestiário?
- [ ] ??????

## Roadmap Atualização para o Jogo Do Ano

- [ ] Poderes e Habilidades de classes
- [ ] Origens
- [ ] Perícias
- [ ] Poderes de Combate
- [ ] Poderes de Destino
- [ ] Poderes de Magia
- [x] Poderes Concedidos
- [ ] Poderes da Tormenta
- [x] Magias
- [ ] Equipamento - Armas
- [ ] Equipamento - Armaduras & Escudos
- [ ] Equipamento - Itens Gerais
- [ ] Itens Superiores
- [ ] Combate
- [ ] Condições

## FAQ

### Qual versão do livro está sendo usada?

No momento está sendo feita a atualização para a versão Jogo do Ano, mais precisamente a 3ª edição lançada.

### Como posso contribuir?

Sugestões e feedbacks sempre são bem vindos, você pode usar as [issues](https://github.com/pyanderson/roll20_tormenta20_grimoire/issues) para isso.

Se você já possui alguma experiência com git e github e quer ajudar a manter o conteúdo atualizado pode abrir um Pull Request atualizando alguma magia, habilidade, poder, etc.

### Como funciona o Roadmap? Existe algum prazo?

Conforme as ideias surgem ou recebo sugestões, elas são adicionadas no Roadmap, então não necessariamente ele será executado na ordem que aparece, mas as ideias e sugestões da comunidade influenciam bastante na ordem que as coisas serão feitas.

Como esse é um projeto que estou mantendo no meu tempo livre não é possível determinar prazos.

## Desenvolvendo

### Configurando o ambiente

O firefox não tem suporte para a versão 3 do manifest, por isso é necessário ter as duas versões disponíveis.

Copie para a pasta `src/` o manifest do navegador que você irá testar as mudanças:

```bash
cp chrome/manifest.json src/manifest.json
```

Instale as dependências de desenvolvimento:

```bash
npm i
```

Inicie o webpack:

```bash
npm run watch
```

Pronto agora você já pode carregar a extensão local no seu navegador, o webpack manterá o bundle sempre atualizado, mas dependendo de como você estiver utilizando a extensão no seu navegador você pode precisar recarregar a extensão para ver as mudanças refletidas.
