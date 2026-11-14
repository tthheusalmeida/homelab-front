# CLAUDE.md — Front (homelab-front)

SPA React 19 + Vite 8 + TypeScript, Tailwind 4, shadcn/base-ui, TanStack Query, React Router 7. Consome a API do `back` (`VITE_API_URL`, em `.env`; hoje `http://localhost:3000/api/v1`). Dev em `http://localhost:5173`.

## Como consultar regras de negócio
**Leia `doc/` antes de abrir código.** Cada arquivo descreve em frases o comportamento de uma área. Só abra o código se a regra não estiver documentada.

| Arquivo | Assunto |
|---|---|
| `doc/home.md` | Home: status dos serviços, cards, relógio |
| `doc/chat.md` | Chat com IA: seleção provider/modelo/thinking, envio, cancelamento |
| `doc/usage.md` | Uso de IA: métricas, filtro, formatação |
| `doc/jobs.md` | Criar e acompanhar jobs |
| `doc/lib.md` | `api()`, formatadores, query client |
| `doc/testing.md` | Convenções de teste e como rodar |

## Comandos
- `npm run dev` — servidor de desenvolvimento
- `npm test` — testes (Vitest, `*.test.ts(x)`)
- `npm run test:watch`
- `npm run build` (`tsc -b && vite build`) / `npm run lint` (oxlint)

## Mapa do código (`src/`)
- `app/router.tsx` + `app/layouts/AppLayout.tsx` — rotas: `/`, `/ai/chat`, `/ai/usage`, `/jobs/create`, `/jobs/track`
- `pages/<área>/` — cada página segue `Page.tsx`, `api/` (chamadas HTTP), `hooks/` (TanStack Query), `components/`, `types/`
  - `home/`, `ai/chat/`, `ai/usage/`, `jobs/create/`, `jobs/track/` (+ `jobs/types`)
- `components/` — compartilhados (`ErrorState`, `LoadingState`, `MarkdownMessage`, `ClockAndTime`, `AppSidebar`)
- `ui/` — componentes shadcn/base-ui (não alterar sem necessidade)
- `lib/` — `api.ts`, `format.ts`, `queryClient.ts`, `utils.ts` (`cn`)
- `hooks/use-mobile.ts`
- `test/` — `setup.ts` (jest-dom, polyfills de jsdom) e `utils.tsx` (`createWrapper`, `renderWithQuery`)

## Convenções
- Aliases por `package.json#imports`: `#components/*`, `#ui/*`, `#lib/*`, `#hooks/*`.
- Textos de interface em **português**.
- Dados de servidor sempre via TanStack Query (hooks em `hooks/`, chamadas em `api/`); chamadas HTTP passam por `#lib/api`, exceto o health da Home (usa `fetch` direto com URL completa).
- `jobs` faz polling a cada 1 s; health da Home a cada 15 s.

## Regras para testes (OBRIGATÓRIO)
- Toda funcionalidade nova ou alterada precisa de teste ao lado do arquivo (`*.test.ts` / `*.test.tsx`).
- **Nome de cada teste: `when <situação>, should <resultado>`** (ex.: `it('when the url is empty, should disable the submit button')`).
- Se uma mudança quebrar um teste, decida se é regressão (corrija o código) ou mudança de regra (atualize teste **e** `doc/`).
- Ao mudar comportamento, atualize o `doc/` correspondente na mesma entrega.
- Não chame a API real: mocke `#lib/api`, os módulos `api/` ou os hooks.
- Prefira consultar por texto/role (Testing Library) a classes CSS; classes só quando o estado visual é a própria regra.
