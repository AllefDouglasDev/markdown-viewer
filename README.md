# Markdown Renderer - Electron App

Aplicação Electron para renderizar arquivos Markdown em uma janela nativa, acessível via linha de comando.

## Tecnologias

- **Electron**: Framework para aplicações desktop
- **React**: Biblioteca para UI
- **react-markdown**: Renderização de Markdown com suporte a plugins
- **remark-gfm**: GitHub Flavored Markdown
- **rehype-highlight**: Syntax highlighting para código

## Instalação

```bash
npm install
```

## Uso

### Pré-requisito: Build do Webpack

Antes de usar a aplicação, compile o código React:

```bash
npm run webpack
```

### Modo 1: Teste Rápido

```bash
npm test
# Ou diretamente:
npm start example.md
```

### Modo 2: CLI Wrapper

```bash
./bin/md example.md
```

### Modo 3: Instalação Global

```bash
npm link
md /caminho/para/arquivo.md
```

### Modo Desenvolvimento (com Hot Reload)

**Terminal 1** - Webpack Dev Server:
```bash
npm run webpack:watch
```

**Terminal 2** - Electron:
```bash
npm run dev example.md
```

**Importante:** O modo dev (`--dev` flag) tenta carregar de `localhost:8080`. Use apenas se estiver rodando o webpack-dev-server.

## Troubleshooting

### Janela não aparece

1. Verifique se você está executando **localmente** (não via SSH)
2. Certifique-se de que compilou o webpack: `npm run webpack`
3. Teste com: `npm test`
4. Verifique os logs no terminal

### Erro "Cannot find module"

Execute `npm install` novamente.

### Tela branca

1. Abra o DevTools (menu View → Toggle Developer Tools)
2. Verifique erros no console
3. Certifique-se de que `dist/bundle.js` existe

## Estrutura do Projeto

```
markdown/
├── bin/
│   └── md              # CLI script
├── src/
│   ├── main/
│   │   ├── index.js    # Electron main process
│   │   └── preload.js  # Preload script (IPC bridge)
│   └── renderer/
│       ├── index.html  # HTML template
│       ├── index.jsx   # React entry point
│       ├── App.jsx     # Main React component
│       └── styles.css  # Styles
├── webpack.config.js   # Webpack configuration
└── package.json
```

## Funcionalidades

- ✅ Renderização de Markdown com GitHub Flavored Markdown
- ✅ Syntax highlighting para blocos de código
- ✅ Live reload (atualiza automaticamente quando o arquivo muda)
- ✅ Suporte a emojis (`:rocket:` → 🚀)
- ✅ Tema dark mode
- ✅ Suporte a tabelas, listas, task lists, links, imagens
- ✅ Comando CLI para abrir arquivos
- ✅ Indicador visual de atualização

## Integração com Neovim

Adicione ao seu `init.vim` ou `init.lua`:

```vim
" Abrir preview do Markdown
nnoremap <leader>mp :!md %<CR>
```

Ou em Lua:

```lua
vim.keymap.set('n', '<leader>mp', ':!md %<CR>', { desc = 'Markdown Preview' })
```
