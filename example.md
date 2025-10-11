# Exemplo de Markdown

Este é um arquivo de exemplo para testar o renderer.

## Funcionalidades

### Texto primeiro

Texto normal, **negrito**, *itálico*, ~~tachado~~.

### Listas

Lista não ordenada:
- Item 1
- Item 2
- Item 3
  - Subitem 2.1
  - Subitem 2.2

Lista ordenada:
1. Primeiro
2. Segundo
3. Terceiro
4. Quarto

### Código

Inline code: `const x = 42;`

Bloco de código JavaScript:

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
```

Bloco de código Python:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))
```

### Links

[GitHub](https://github.com)

### Citações

> Esta é uma citação.
> Pode ter múltiplas linhas.

### Tabelas

| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| A        | B        | C        |
| 1        | 2        | 3        |
| X        | Y        | Z        |

### Linha Horizontal

---

### Task List (GFM)

- [x] Tarefa completa
- [ ] Tarefa pendente
- [ ] Outra tarefa

### Emoji

Emojis com códigos shortcode:

:rocket: :sparkles: :fire: :tada: :star: :heart: :smile: :thumbsup:

:coffee: :computer: :books: :bulb: :warning: :heavy_check_mark:

Emojis nativos também funcionam: 🚀 ✨ 🔥 🎉
