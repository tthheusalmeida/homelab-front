# CLAUDE.md — Front (homelab-front)

SPA React 19 + Vite 8 + TypeScript, Tailwind 4, shadcn/base-ui, TanStack Query, React Router 7. Consome a API do `back` (`VITE_API_URL`, em `.env`; hoje `http://localhost:3000/api/v1`). Dev em `http://localhost:5173`.

## Como consultar regras de negócio
**Leia `doc/` antes de abrir código.** Cada arquivo descreve em frases o comportamento de uma área. Só abra o código se a regra não estiver documentada.

| Arquivo | Assunto |
|---|---|
| `doc/home.md` | Home: status dos serviços, cards, relógio |
| `doc/chat.md` | Chat com IA: seleção provider/modelo/thinking, envio, cancelamento |
| `doc/usage.md` | Uso de IA: métricas, filtro, formatação |
| `doc/library.md` | Biblioteca: acervo, busca/filtros, documento, edição, livros (módulos, leitura, pesquisa), entrada (adicionar/remover/descartar), novo artigo |
| `doc/jobs.md` | Criar e acompanhar jobs |
| `doc/components.md` | Regra de reuso de componentes base e lista dos existentes |
| `doc/lib.md` | `api()`, formatadores, query client |
| `doc/testing.md` | Convenções de teste e como rodar |

## Comandos
- `npm run dev` — servidor de desenvolvimento
- `npm test` — testes (Vitest, `*.test.ts(x)`)
- `npm run test:watch`
- `npm run build` (`tsc -b && vite build`) / `npm run lint` (oxlint)

## Mapa do código (`src/`)
- `app/router.tsx` + `app/layouts/AppLayout.tsx` — rotas: `/`, `/library`, `/library/inbox`, `/library/new`, `/library/books`, `/library/books/:bookId`, `/library/:id`, `/library/:id/edit`, `/ai/chat`, `/ai/usage`, `/jobs/create`, `/jobs/track`
- `pages/<área>/` — cada página segue `Page.tsx`, `api/` (chamadas HTTP), `hooks/` (TanStack Query), `components/`, `types/`
  - `home/`, `library/`, `ai/chat/`, `ai/usage/`, `jobs/create/`, `jobs/track/` (+ `jobs/types`)
- `components/` — componentes base compartilhados (`ErrorState`, `LoadingState`, `EmptyState`, `MarkdownMessage`, `OptionSelect`, `SearchInput`, `TagInput`, `CategoryPicker`, `DocumentFields`, `MarkdownEditor`, `ConfirmDialog`, `ClockAndTime`, `AppSidebar`)
- `ui/` — apenas primitivos shadcn/base-ui (não alterar sem necessidade; componentes base próprios vão em `components/`)
- `lib/` — `api.ts`, `format.ts`, `queryClient.ts`, `utils.ts` (`cn`)
- `hooks/` — `use-mobile.ts`, `use-debounced-value.ts`, `use-stored-state.ts`
- `test/` — `setup.ts` (jest-dom, polyfills de jsdom) e `utils.tsx` (`createWrapper`, `renderWithQuery`)

## Convenções
- Aliases por `package.json#imports`: `#components/*`, `#ui/*`, `#lib/*`, `#hooks/*`.
- Textos de interface em **português**.
- URLs de API e de serviços vêm de variável de ambiente (`VITE_*` no `.env`; modelo em `.env.example`), nunca fixas no código. As URLs de health da Home derivam de `VITE_API_URL`.
- Dados de servidor sempre via TanStack Query (hooks em `hooks/`, chamadas em `api/`); chamadas HTTP passam por `#lib/api`, exceto o health da Home (usa `fetch` direto com URL completa).
- `jobs` faz polling a cada 1 s; health da Home a cada 15 s.

## Componentes (OBRIGATÓRIO)
- **Antes de criar qualquer UI, valide se já existe um componente base** em `src/ui/` ou `src/components/` e use-o. Detalhes e lista em `doc/components.md`.
- Se não existe e o padrão se repete, **crie o componente base primeiro, em `src/components/`,** e então use-o (inclusive onde o padrão já estava duplicado). Não duplique HTML/Tailwind solto.
- Siga o padrão dos existentes (props tipadas, `cn()`, aliases `#ui/*` `#components/*`).

## Regras para testes (OBRIGATÓRIO)
- **Toda feature (nova ou alterada) deve vir acompanhada de testes unitários na mesma entrega.** Uma feature sem testes não é considerada concluída; cubra o caminho feliz, os erros e os casos de borda das regras novas.
- Toda funcionalidade nova ou alterada precisa de teste ao lado do arquivo (`*.test.ts` / `*.test.tsx`).
- **Nome de cada teste: `when <situação>, should <resultado>`** (ex.: `it('when the url is empty, should disable the submit button')`).
- Se uma mudança quebrar um teste, decida se é regressão (corrija o código) ou mudança de regra (atualize teste **e** `doc/`).
- Ao mudar comportamento, atualize o `doc/` correspondente na mesma entrega.
- Não chame a API real: mocke `#lib/api`, os módulos `api/` ou os hooks.
- Prefira consultar por texto/role (Testing Library) a classes CSS; classes só quando o estado visual é a própria regra.
