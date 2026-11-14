# Componentes base (regra de reuso)

## Regra
1. **Antes de criar qualquer elemento de interface, verifique se já existe um componente base** que resolva. Procure em `src/ui/` e `src/components/` (e, se for da mesma página, em `pages/<área>/components/`).
2. **Se existe, use-o.** Não recrie com HTML/Tailwind solto nem crie uma variação paralela. Se faltar uma opção, estenda o componente existente (nova prop ou variante) em vez de duplicar.
3. **Se não existe e o mesmo padrão aparece (ou vai aparecer) em mais de um lugar, crie o componente base primeiro em `src/components/` e depois use-o** nos pontos de uso, inclusive nos já existentes que repetem o padrão. Componentes base novos **sempre** ficam em `src/components/`, nunca em `src/ui/` nem dentro de `pages/`.
4. Se só aparece em um lugar e não há sinal de reuso, mantenha local na página; extraia quando surgir a segunda ocorrência.
5. Siga o padrão dos componentes existentes: função nomeada exportada, `interface <Nome>Props`, estilos com `cn()` (`#lib/utils`), imports pelos aliases (`#ui/*`, `#components/*`, `#lib/*`).
6. Todo componente base novo ou alterado precisa de teste (`when …, should …`) e, se tiver regra de comportamento, de uma entrada no `doc/` da área.

## Onde ficam
- `src/ui/` — primitivos shadcn/base-ui: `badge`, `button`, `card`, `chart`, `collapsible`, `dialog`, `input`, `label`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `table`, `textarea`, `tooltip`. Só recebe primitivos vindos do CLI do shadcn (`components.json`); componentes base próprios do projeto não vão aqui.
- `src/components/` — **local dos componentes base do projeto**, compartilhados entre páginas: `ErrorState` (erro com ação opcional), `LoadingState` (texto com pontinhos), `MarkdownMessage` (Markdown GFM), `ClockAndTime`, `AppSidebar`.
- `pages/<área>/components/` — específicos da página, sem reuso; ao surgir o segundo uso, mova/crie o componente em `src/components/`.

## Padrões já estabelecidos (reutilize)
- Carregando: `LoadingState`. Erro de carregamento: `ErrorState` dentro de `Card`/`CardContent`.
- Status de job: `JobStatusBadge`; etapa de fluxo: `JobStep`.
- Seleção de provider/modelo/thinking: `ChatSettingsSelect` (usado no chat e no formulário de resumo; há um TODO para extrair um seletor próprio, o que seguiria a regra 3, criando o componente em `src/components/`).
- Cartões de métrica: `Card`/`CardHeader`/`CardContent`; tabelas: `Table*`; selos: `Badge`.
