# Home (`pages/home`)

## Serviços monitorados
- Lista fixa em `types/services.types.ts`: **HomeLab** (`/health/system`) e **AI** (`/health/ai`), as URLs são montadas a partir de `VITE_API_URL` (nenhum host fixo no código).
- Cada serviço é consultado a cada **15 s**, sem retry. Falha de um serviço não afeta os outros.

## Contadores (`useSystemHealth`)
- Considera só serviços que responderam; soma os `checks` de todos eles.
- `online` = checks `ok`; `offline` = checks `error`; `total` = todos os checks.
- `allOnline`: total > 0 e todos online. `allOffline`: total > 0 e todos offline. `hasOffline`: offline > 0.
- Se todas as requisições falham, total é 0 e nem `allOnline` nem `allOffline` são verdadeiros.
- `isLoading` é verdadeiro enquanto qualquer consulta estiver carregando.

## Status do sistema (`SystemStatus`)
- Carregando: "Verificando" (tem prioridade sobre os demais).
- Todos online: "Todos os sistemas operacionais".
- Todos offline: "TODOS OS SISTEMAS FORA DO AR".
- Caso contrário: "Alguns sistemas estão fora do ar".

## Cartão de visão geral (`OverviewSection`)
- Mostra o total de serviços e "N online"; "N offline" só aparece se houver offline.

## Cartão de serviço (`ServiceCard`)
- Carregando: texto "Verificando serviços..." no lugar dos checks.
- Descrição: usa a do health quando existe, senão a do serviço.
- Cada check mostra nome formatado (`api` → "API", outros com inicial maiúscula), descrição e bolinha de status.
- O serviço é considerado online só se **todos** os checks estão `ok` (sem dados = offline).
- O link abre `service.url` em nova aba.

## Bolinhas
- `ServiceCardStatus`: carregando = cinza animado; online = verde animado; offline = vermelho parado.
- `ServiceStatus`: carregando = pulsando; erro = vermelho; senão verde.

## Relógio (`ClockAndTime`)
- Atualiza a cada 1 s (pt-BR, com segundos); limpa o intervalo ao desmontar.
- Data por extenso com dia da semana e mês capitalizados (ex.: "Segunda-Feira, 5 de Janeiro de 2026").
