# Jobs (`pages/jobs`)

## Criar (`/jobs/create`)
- Busca os tipos em `GET /jobs/types`. Carregando: "Carregando". Erro: "Oops! houve uma falha ao carregar os tipos de jobs."
- Cada tipo vira um cartão (label, descrição e botão "Criar"). Clicar abre um diálogo com o formulário do tipo; fechar o diálogo limpa a seleção.
- `JobForm` escolhe o formulário pelo `type`: `video-to-transcript` → transcrição; `video-to-summary` → resumo; tipo desconhecido → nada.

### Transcrição
- Campo URL do vídeo (obrigatório, tipo url). Botão "Criar" desabilitado com URL vazia ou só espaços, ou enquanto cria.
- Envia `POST /jobs/video-to-transcript` com `{ url }`.
- Erro: "Não foi possível criar o job. Tente novamente."

### Dados do documento (nos dois formulários)
- Abaixo da URL há o bloco opcional "Dados do documento" (`JobDocumentFields` → `DocumentFields`): título, categoria (até 4 níveis, com as categorias já existentes como sugestão) e tags. Texto explica que o que for preenchido já vem pronto na Entrada e pode ser ajustado ao adicionar à biblioteca.
- O título vazio mostra o padrão como dica ("Se vazio: Transcrição de vídeo" / "Se vazio: Resumo de vídeo").
- O envio inclui `title`, `category` e `tags` **somente se preenchidos** (título aparado, níveis em branco descartados); vazios ficam de fora do corpo da requisição. Campos ficam desabilitados durante a criação.
- O diálogo de criação tem altura máxima de 90% da tela e rola por dentro.

### Resumo
- Além da URL, exige provider, modelo e thinking (reaproveita os selects do chat). Sem os três escolhidos o botão fica desabilitado e nada é enviado.
- Trocar provider limpa modelo e thinking; trocar modelo limpa thinking. **Aqui não há valor padrão**: o usuário precisa escolher.
- **Nível de detalhe** (select, padrão **Detalhado**): Resumo curto, Detalhado (mantém conceitos, explicações, comandos e exemplos) e Estudo completo (material de consulta organizado; aulas longas são resumidas em partes). Uma frase abaixo do select descreve o nível escolhido.
- Envia `POST /jobs/video-to-summary` com `{ url, providerId, modelId, thinking, detail }` (mais título, categoria e tags se preenchidos).
- Durante a criação, campos e botão ficam desabilitados.

## Acompanhar (`/jobs/track`)
- Busca `GET /jobs` a cada **1 s**. Carregando: "Carregando". Erro: "Oops! houve uma falha ao carregar os jobs."
- Lista ordenada do **mais novo para o mais antigo** (por `createdAt`), sem alterar o array original.
- Cada item mostra label, id, status, "Criado em" (data e hora pt-BR) e, ao expandir, o fluxo.
- **Duração**: só aparece com `startedAt` e `completedAt`; formatada como `ms/s/m/h`.

### Status (badge)
- `pending` "Pendente", `running` "Em execução" (ícone girando), `completed` "Concluído" (verde), `failed` "Falhou" (destrutivo).

### Fluxo (`JobFlow`)
- Três fases: Pendente → Processando → Concluído.
- Job `completed`: todas as fases concluídas. Job `failed`: todas marcadas como falha.
- Caso contrário: a fase igual ao status do job fica ativa, as anteriores concluídas, as seguintes pendentes.
- As etapas detalhadas do job aparecem sob "Processando" sempre que o job tem etapas (independe do status).
- Etapa `completed` = concluída, `running` = ativa (girando), `failed` = falha, qualquer outra = pendente.
