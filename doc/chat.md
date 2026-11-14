# Chat com IA (`pages/ai/chat`)

## Seleção de provider, modelo e thinking
- Enquanto o usuário não escolhe, valem os **primeiros** itens de cada lista (primeiro provider, primeiro modelo dele, primeira opção de thinking).
- Trocar o provider limpa modelo e thinking; trocar o modelo limpa o thinking (voltam ao padrão da nova lista).
- Modelos só são buscados com provider definido; thinking só com provider **e** modelo.
- O select de modelo fica desabilitado sem provider ou carregando; o de thinking, sem modelo ou carregando.

## Envio
- Só é possível enviar com: mensagem não vazia (após `trim`), provider, modelo e thinking definidos, nada carregando e nenhum envio em andamento.
- Enter envia; Shift+Enter quebra linha; Enter é ignorado se desabilitado ou enviando.
- Ao enviar: a mensagem (já sem espaços nas pontas) entra na lista como "user", o campo é limpo e o status vira "sending" (mostra "Pensando...").
- Resposta: entra como "assistant", renderizada em Markdown (GFM); status volta a "idle".
- O corpo enviado a `POST /chat` é `{ providerId, modelId, thinking, message }` (o campo é `thinking`, igual ao DTO do back).
- Enquanto envia, o botão vira "pausar"; clicar nele **cancela** a requisição e mostra "Geração cancelada".
- Erro de abort também mostra "Geração cancelada"; qualquer outro erro apenas volta a "idle" e registra `console.error` (não há mensagem de erro na tela).
- Enviar nova mensagem aborta a anterior se ainda estiver pendente.
- Não há histórico persistido: recarregar a página zera a conversa.

## Tela vazia
- Sem mensagens e status "idle": mostra "Como posso te ajudar hoje?" com frases digitando em loop (70 ms por letra, 2,2 s de espera, 35 ms para apagar, 0,9 s de pausa).

## Lista de mensagens
- Rola sempre para a última mensagem quando muda a lista ou o status.
- Usuário: texto puro à direita. Assistente: Markdown à esquerda.
