# NeoVim Integration

Integração do Markdown Viewer com NeoVim para preview em tempo real sem bloquear o editor.

## Instalação

### 1. Instalar o aplicativo globalmente

```bash
npm link
```

### 2. Configurar no NeoVim

Adicione ao seu `init.lua`:

```lua
-- Carregar o plugin de markdown preview
local markdown_preview = require('path.to.markdown.nvim.markdown-preview')

-- Configurar com o keymap padrão (<leader>md)
markdown_preview.setup()

-- Ou customizar o keymap
markdown_preview.setup({
  keymap = '<leader>mp'  -- Use o atalho que preferir
})
```

**Importante:** Substitua `'path.to.markdown.nvim.markdown-preview'` pelo caminho correto. Por exemplo:

```lua
-- Se você clonou em ~/projects/markdown
local markdown_preview = require('projects.markdown.nvim.markdown-preview')
markdown_preview.setup()
```

Ou adicione o diretório ao runtimepath:

```lua
vim.opt.runtimepath:append('~/Documents/dev/node/markdown')
local markdown_preview = require('nvim.markdown-preview')
markdown_preview.setup()
```

## Uso

### Atalhos de teclado

- `<leader>md` - Abre/fecha o preview (toggle)

### Comandos

- `:MarkdownPreview` - Inicia o preview
- `:MarkdownPreviewStop` - Para o preview
- `:MarkdownPreviewToggle` - Alterna entre abrir/fechar

## Como funciona

1. Quando você abre o preview, o plugin:
   - Cria um arquivo temporário com o conteúdo do buffer atual
   - Inicia a aplicação em background (não bloqueia o editor)
   - Configura auto-commands para atualizar o arquivo temporário

2. Enquanto você edita:
   - A cada mudança no texto (com debounce de 300ms)
   - O conteúdo é salvo no arquivo temporário
   - A aplicação detecta a mudança e atualiza a visualização

3. Quando você fecha:
   - O buffer é deletado, ou você executa `:MarkdownPreviewStop`
   - O processo da aplicação é encerrado
   - O arquivo temporário é removido

## Vantagens

- **Não bloqueia o editor**: A aplicação roda em background usando `jobstart` com `detach = true`
- **Atualização em tempo real**: Debounce de 300ms para não sobrecarregar
- **Limpeza automática**: Remove arquivos temporários e processos automaticamente
- **Funciona com qualquer buffer**: Não precisa ser um arquivo salvo
- **Integração nativa**: Usa apenas APIs do NeoVim (jobstart, autocmd, keymap)

## Requisitos

- NeoVim 0.7+
- Aplicação markdown instalada globalmente (`npm link`)
- Node.js instalado no sistema

## Troubleshooting

### Preview não abre

1. Verifique se o comando `md` está disponível:
   ```bash
   which md
   ```

2. Se o comando não for encontrado, execute `npm link` no diretório do projeto:
   ```bash
   cd ~/Documents/dev/node/markdown
   npm link
   ```

3. Certifique-se de que o NVM está configurado corretamente no seu shell:
   ```bash
   # Adicione ao ~/.zshrc ou ~/.bashrc
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```

4. Teste manualmente:
   ```bash
   md /tmp/test.md
   ```

### Erro "is not executable"

Se você receber o erro `is not executable`, verifique:

1. O arquivo tem permissão de execução:
   ```bash
   ls -la $(which md)
   chmod +x $(which md)
   ```

2. O NeoVim está usando o mesmo PATH do seu shell:
   ```vim
   :echo $PATH
   ```

3. Copie o arquivo atualizado para o local correto:
   ```bash
   # Se você copiou o arquivo para ~/.config/nvim/lua/allef/core/
   cp ~/Documents/dev/node/markdown/nvim/markdown-preview.lua ~/.config/nvim/lua/allef/core/markdown.lua
   ```

### Preview não atualiza

1. Verifique se os auto-commands estão ativos:
   ```vim
   :autocmd MarkdownPreviewSync
   ```

### Erro ao carregar o módulo

Certifique-se de que o caminho no `require()` está correto e que o NeoVim consegue encontrar o arquivo.

## Desinstalação

Para remover a integração, simplesmente remova as linhas do seu `init.lua` e execute:

```bash
npm unlink
```
