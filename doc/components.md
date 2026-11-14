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
- `src/components/` — **local dos componentes base do projeto**, compartilhados entre páginas: `ErrorState` (erro com ação opcional), `LoadingState` (texto com pontinhos), `EmptyState` (estado vazio com ícone, texto e ação), `MarkdownMessage` (Markdown GFM; links em nova aba, imagens responsivas, sem HTML cru; `headingIds` dá id aos títulos para âncoras, com prefixo opcional `idPrefix`), `OptionSelect` (select de opções `{id,label}`), `SearchInput` (campo de pesquisa), `TagInput` (tags em chips), `CategoryPicker` (categoria em até 4 níveis com sugestões), `DocumentFields` (título, categoria e tags de um documento, com os textos que explicam pasta x tag), `MarkdownEditor` (editor Markdown com prévia e atalhos de imagem por URL e tabela), `PaperPage` (folha de leitura com as cores do tema), `OutlineNav` (sumário clicável com o item em leitura destacado), `BackToTopButton` (voltar ao topo, fixo no canto de baixo à direita da página), `ReadingSection` (seção de texto do modo leitura, sem moldura; usada pela página e por cada capítulo do livro, para os dois ficarem iguais), `ReadingMode` (tela cheia só com o texto e o sumário; Esc sai; `MarkdownMessage` aceita `size` sm|base e `className`), `ConfirmDialog` (confirmação, com modo destrutivo e `errorMessage` opcional), `ClockAndTime`, `AppSidebar`.
- `src/hooks/` — `use-mobile`, `use-debounced-value`, `use-active-section` (id da seção em leitura, pela rolagem), `use-back-to-top` (quando mostrar o botão de voltar ao topo), `use-text-highlight` (destaca no texto os termos buscados e navega entre as ocorrências), `use-stored-state` (estado de texto no localStorage, com valores permitidos e tolerante a falha).
- `pages/<área>/components/` — específicos da página, sem reuso; ao surgir o segundo uso, mova/crie o componente em `src/components/`.

## Padrões já estabelecidos (reutilize)
- Carregando: `LoadingState`. Erro de carregamento: `ErrorState` dentro de `Card`/`CardContent`.
- Status de job: `JobStatusBadge`; etapa de fluxo: `JobStep`.
- Seleção de uma opção (provider, modelo, thinking, tipo, origem, ordenação): `OptionSelect`.
- Estado vazio: `EmptyState`. Confirmação antes de ação destrutiva: `ConfirmDialog`. Pesquisa: `SearchInput`. Tags: `TagInput`. Texto em Markdown editável: `MarkdownEditor`. Título + categoria + tags de documento: `DocumentFields` (Novo artigo, Adicionar, Editar e criação de jobs). Categoria hierárquica: `CategoryPicker`.
- Links que parecem botão: `<Link className={buttonVariants({ variant })}>` (`#ui/button`), não `Button` envolvendo link.
- Cartões de métrica: `Card`/`CardHeader`/`CardContent`; tabelas: `Table*`; selos: `Badge`.
