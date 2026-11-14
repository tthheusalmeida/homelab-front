# Testes (front)

- Framework: Vitest + jsdom + Testing Library (`@testing-library/react`, `jest-dom`, `user-event`). Config no bloco `test` de `vite.config.ts`.
- Setup global (`src/test/setup.ts`): matchers do jest-dom, limpeza automática e polyfills de jsdom (`ResizeObserver`, `matchMedia`, `scrollIntoView`, `getAnimations`) exigidos pelos componentes base-ui.
- Helpers (`src/test/utils.tsx`): `createWrapper()` (QueryClient sem retry) e `renderWithQuery(ui)`.
- Rodar: `npm test` (tudo), `npx vitest run caminho/arquivo.test.tsx` (um), `npm run test:watch`.
- Arquivo de teste fica ao lado do código (`x.ts` → `x.test.ts`); componentes pequenos de uma pasta podem compartilhar um arquivo (`*-components.test.tsx`).

## Regra de entrega
Toda feature (nova ou alterada) deve vir acompanhada de testes unitários na mesma entrega. Feature sem testes não está concluída. Cubra o caminho feliz, os erros e os casos de borda, e rode a suíte completa antes de finalizar.

## Padrão de nome (obrigatório)
`it('when <situação>, should <resultado>', ...)`. `describe` agrupa por componente/hook/função.

## O que é mockado
- Rede: `#lib/api` ou `fetch` (`vi.stubGlobal`) — nunca a API real.
- Hooks de dados: nos testes de página/formulário, os hooks são mockados para controlar loading/erro/dados.
- Timers: `vi.useFakeTimers()` (relógio e animação de digitação).

## Cobertura atual
`lib/*`, `use-mobile`, api e hooks de chat/usage/home/jobs, `ChatPage`, componentes de chat, páginas Create/Track/Usage (loading/erro/dados/filtro), formulários e cartões de jobs, fluxo e status de jobs, componentes da Home, componentes compartilhados.

Não coberto: `AppLayout`/`AppSidebar`, `router.tsx`, `src/ui/*` (shadcn), gráficos (`UsageTimeline`, `ProviderUsage`, `ModelUsage`, recharts) e `ChatSettings(Select)`.
