# Uso de IA (`pages/ai/usage`)

- Busca `GET /ai/usage` (com `?provider=` quando filtrado) via `useAiUsage`; cache de 30 s.
- Filtro: botões "Todos", "Ollama" e "Gemini". "Todos" remove o filtro. Hoje não há filtro por data (marcado como TODO no código).
- Carregando: "Carregando". Erro ou sem dados: "Oops! houve falha ao carregar o uso de IA".

## Resumo (4 cartões)
- Requests e Tokens: formatados com K/M/B (1.500 → "1.5K", 2.500.000 → "2.5M").
- Custo estimado: em dólar com 2 casas (`$1.23`).
- Latência média: ms abaixo de 1 s, depois s, m ou h (1500 → "1.5s").

## Requests recentes (tabela)
- Colunas: provider, modelo, operação, tokens (K/M/B), latência, custo (4 casas), status.
- Status: "Success" (verde) ou "Failed" (vermelho).

## Outras seções
- Timeline, uso por provider e uso por modelo recebem os dados prontos do back.
