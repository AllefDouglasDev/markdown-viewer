# Release Process

Este documento descreve o processo para criar e publicar uma nova versão do Markdown Viewer.

## Preparação

### 1. Atualizar Versão

Edite o `package.json` e atualize o campo `version`:

```json
{
  "version": "1.1.0"
}
```

### 2. Atualizar Changelog

Se você mantém um CHANGELOG.md, adicione as mudanças da nova versão.

### 3. Compilar o Bundle

```bash
npm run webpack
```

## Build Local

### Testar Build Localmente

Antes de publicar, teste o build localmente:

```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux
```

Os executáveis estarão em `release/`.

### Testar o Executável

1. Instale o executável gerado
2. Teste as funcionalidades principais:
   - Abrir arquivo markdown
   - Live reload
   - Diagramas Mermaid
   - Syntax highlighting
3. Verifique se não há erros no console

## Publicação no GitHub

### 1. Commit e Push

```bash
git add .
git commit -m "chore: bump version to 1.1.0"
git push origin main
```

### 2. Criar Tag

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

### 3. Configurar Token do GitHub

O `electron-builder` precisa de um token do GitHub para publicar releases:

```bash
# Criar token em: https://github.com/settings/tokens
# Permissões necessárias: repo (todas)

# Exportar token (adicione ao seu .bashrc ou .zshrc)
export GH_TOKEN="seu_token_aqui"
```

### 4. Publicar Release

```bash
npm run release
```

Este comando:
1. Executa `npm run webpack` (via prebuild)
2. Cria os executáveis para todas as plataformas configuradas
3. Faz upload dos arquivos para GitHub Releases
4. Gera o arquivo `latest.yml` para auto-update

## Após Publicação

### 1. Verificar Release no GitHub

Acesse https://github.com/AllefDouglasDev/markdown-viewer/releases e verifique:
- [ ] Release foi criada corretamente
- [ ] Todos os arquivos foram enviados (.dmg, .zip, .exe, .AppImage, .deb)
- [ ] Arquivos `latest-*.yml` estão presentes

### 2. Testar Auto-Update

1. Instale uma versão anterior do app
2. Abra o app e espere 3 segundos
3. Verifique se a notificação de atualização aparece
4. Teste o download e instalação

### 3. Anunciar Release

Considere anunciar a nova versão:
- README do projeto
- Documentação
- Redes sociais
- Newsletter

## Troubleshooting

### Erro ao Publicar

Se `npm run release` falhar:

1. **Token Inválido**: Verifique se `GH_TOKEN` está configurado
2. **Permissões**: Certifique-se de que o token tem permissão `repo`
3. **Tag já existe**: Delete a tag e recrie se necessário
4. **Build falhou**: Execute `npm run build` localmente para debugar

### Auto-Update Não Funciona

1. **Arquivo latest.yml**: Verifique se foi gerado e enviado
2. **URL do Release**: Confirme o repositório em `package.json` → `build.publish`
3. **Versão**: A versão instalada deve ser menor que a publicada
4. **Modo Dev**: Auto-update é desabilitado em modo `--dev`

## Assinatura de Código

Para distribuição pública em macOS e Windows, é recomendado assinar o código:

### macOS

1. Obter Apple Developer ID
2. Instalar certificado no keychain
3. Configurar em `package.json`:

```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Seu Nome (TEAM_ID)"
    }
  }
}
```

### Windows

1. Obter certificado de code signing
2. Configurar em `package.json`:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/cert.pfx",
      "certificatePassword": "password"
    }
  }
}
```

## Checklist de Release

- [ ] Versão atualizada em `package.json`
- [ ] Changelog atualizado (se aplicável)
- [ ] Bundle webpack compilado
- [ ] Build local testado
- [ ] Executável testado manualmente
- [ ] Commit criado e enviado
- [ ] Tag criada e enviada
- [ ] Token GitHub configurado
- [ ] Release publicado
- [ ] Release verificado no GitHub
- [ ] Auto-update testado
- [ ] Release anunciado

## Versões Futuras

Para incrementar versões:

- **Patch** (1.0.0 → 1.0.1): Correções de bugs
  ```bash
  npm version patch
  ```

- **Minor** (1.0.0 → 1.1.0): Novas funcionalidades
  ```bash
  npm version minor
  ```

- **Major** (1.0.0 → 2.0.0): Breaking changes
  ```bash
  npm version major
  ```

Esses comandos atualizam automaticamente o `package.json` e criam um commit com tag.
