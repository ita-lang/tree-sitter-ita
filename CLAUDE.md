# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Itá tree-sitter grammar.

## O que é

Gramática tree-sitter para a linguagem Itá. Usada pelo Zed editor para syntax highlighting.

## Build

```bash
npm install
npx tree-sitter generate
npx tree-sitter parse <file.glu>   # testar parsing
```

## Cobertura

36/37 exemplos parseados sem erros (97%). O único com erros (`formats.glu`) tem `//` dentro de strings — limitação do tree-sitter que precisaria de scanner externo.

## Arquivos importantes

- `grammar.js` — Definição completa da gramática
- `src/parser.c` — Parser gerado (não editar manualmente)
- `src/node-types.json` — Tipos de nodes (útil pra validar highlights.scm)

## Zed extension

Os arquivos de query para o Zed estão no repo principal `ita`:
- `highlights.scm`, `brackets.scm`, `indents.scm`

## Nota sobre highlights.scm

Ao adicionar tokens no highlights.scm, validar contra `src/node-types.json`. Tokens que são named rules (como `pub_modifier`) devem usar `(node_name) @capture` em vez de `"literal" @capture`. Tokens anônimos (keywords usadas inline) podem usar a forma literal.
