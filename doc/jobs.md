# Jobs (`pages/jobs`)

## Criar (`/jobs/create`)
- Busca os tipos em `GET /jobs/types`. Carregando: "Carregando". Erro: "Oops! houve uma falha ao carregar os tipos de jobs."
- Cada tipo vira um cartão (label, descrição e botão "Criar"). Clicar abre um diálogo com o formulário do tipo; fechar o diálogo limpa a seleção.
- `JobForm` escolhe o formulário pelo `type`: `video-to-transcript` → transcrição; `video-to-summary` → resumo; tipo desconhecido → nada.

### Transcrição
- Campo URL do vídeo (obrigatório, tipo url). Botão "Criar" desabilitado com URL vazia ou só espaços, ou enquanto cria.
- Envia `POST /jobs/video-to-transcript` com `{ url }`.
- Erro: "Não foi possível criar o job. Tente novamente."

### Resumo
- Além da URL, exige provider, modelo e thinking (reaproveita os selects do chat). Sem os três escolhidos o botão fica desabilitado e nada é enviado.
- Trocar provider limpa modelo e thinking; trocar modelo limpa thinking. **Aqui não há valor padrão**: o usuário precisa escolher.
- Envia `POST /jobs/video-to-summary` com `{ url, providerId, modelId, thinking }`.
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
