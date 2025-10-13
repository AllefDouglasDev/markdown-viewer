# Build Icons

Esta pasta contém os ícones para o aplicativo em diferentes plataformas.

## Ícones Necessários

### macOS
- **icon.icns** - Ícone para macOS (1024x1024px)
  - Pode ser gerado usando: https://cloudconvert.com/png-to-icns

### Windows
- **icon.ico** - Ícone para Windows (256x256px)
  - Pode ser gerado usando: https://cloudconvert.com/png-to-ico

### Linux
- **icon.png** - Ícone para Linux (512x512px ou maior)

## Gerando Ícones

1. Crie uma imagem PNG de 1024x1024px
2. Use ferramentas online ou locais para converter:
   - Para .icns (macOS): `png2icns` ou CloudConvert
   - Para .ico (Windows): ImageMagick ou CloudConvert
   - Para .png (Linux): Use o PNG original em alta resolução

## Alternativa

Se não tiver ícones customizados, o electron-builder usará ícones padrão do Electron.

## Recomendações de Design

- Use um design simples e reconhecível
- Teste em diferentes tamanhos (16px, 32px, 64px, 128px, 256px, 512px, 1024px)
- Use fundo transparente
- Evite detalhes muito finos que não aparecem em tamanhos pequenos
