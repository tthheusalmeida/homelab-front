# Biblioteca (`pages/library`)

Menu: seção **Biblioteca**, logo depois da seção com "Início", com **Acervo** (`/library`), **Entrada** (`/library/inbox`) e **Novo artigo** (`/library/new`). Um documento abre em `/library/:id`.

Os dados vêm de `/library/*` do back (ver `back/doc/library.md`). Qualquer alteração (adicionar, remover, descartar, criar, reindexar) invalida todas as consultas da biblioteca.

## Acervo (`/library`)
- Lista os documentos **publicados**; ordenação padrão A–Z (alfanumérica natural pt-BR), com opção "Mais recentes".
- **Pesquisa:** campo de texto com espera de 300 ms depois de digitar. Procura em título, nome do arquivo, tags, categorias e no conteúdo dos documentos. Resultado achado só no conteúdo mostra "Encontrado no conteúdo".
- **Filtros combináveis:** tipo (Resumo, Transcrição, Criação), origem (Vídeo, Manual), tags (botões; várias tags exigem todas) e categoria (árvore à esquerda).
- **Árvore de categorias:** "Todas as categorias" + níveis expansíveis com contagem de documentos (inclui os níveis abaixo). Selecionar um nível filtra por ele e por tudo abaixo; os ancestrais da categoria selecionada ficam abertos.
- "Limpar filtros" só aparece com algum filtro ativo e limpa pesquisa, categoria, tipo, origem e tags (a ordenação é mantida).
- Enquanto uma nova pesquisa carrega, a lista anterior continua na tela.
- Estados: carregando; erro (com "Tentar novamente"); **biblioteca vazia** (sem filtros: convida a ir à Entrada); **nenhum resultado** (com filtros: oferece limpar).
- Cada cartão mostra título (link), tipo, categoria, prévia, tags e data de criação.

## Documento (`/library/:id`)
- Mostra título, categoria, tipo, status, tags, origem, datas de criação e atualização, link "Fonte original" (quando há URL de vídeo) e o conteúdo em Markdown.
- Markdown: tabelas, links e imagens por URL aparecem prontos. Links abrem em nova aba; imagens nunca passam da largura do texto. HTML cru não é renderizado.
- "Voltar" retorna à página anterior (resultados da pesquisa ou categoria).
- **Remover da biblioteca:** só para documento publicado; pede confirmação e depois volta ao acervo. É remoção lógica: o arquivo é mantido e pode ser readicionado pela Entrada.
- Erro ou documento inexistente: mensagem com botão "Voltar à biblioteca".

## Entrada (`/library/inbox`)
- Duas visões: **Pendentes** (resumos e transcrições gerados pelos jobs, aguardando decisão) e **Removidos** (tirados da biblioteca), cada uma com contador.
- **Adicionar à biblioteca** (pendente) / **Readicionar** (removido): abre um diálogo com título (preenchido), categoria (até 4 níveis) e tags. Só habilita com título e pelo menos um nível de categoria. Ao concluir, o documento sai da Entrada e entra no Acervo.
- **Descartar:** pede confirmação (cita o título) e apaga o arquivo de vez. Não há desfazer.
- **Reindexar:** reconstrói o índice a partir dos arquivos. Arquivos que não puderam ser lidos aparecem num alerta com nome do arquivo e motivo.
- Vazio: "Nada aguardando decisão" (com link para criar job) e "Nenhum documento removido".

## Novo artigo (`/library/new`)
- Campos: título, categoria (1 a 4 níveis), tags e conteúdo em Markdown. "Salvar artigo" só habilita com título, categoria e conteúdo (não só espaços).
- "Prévia" alterna entre escrever e ver o Markdown renderizado; o texto digitado é mantido ao voltar. Prévia vazia mostra "Nada para mostrar ainda."
- Imagens: apenas por URL (`![alt](https://...)`); não há upload.
- Ao salvar, o artigo nasce publicado e a tela abre o documento criado. Erro mostra mensagem e mantém o formulário.

## Sincronização com as pastas (`LibraryLayout` + `useLibrarySync`)
- Todas as rotas `/library/*` ficam dentro de `LibraryLayout`, que chama `POST library/reindex` ao entrar na Biblioteca e sempre que a janela volta ao foco (no mínimo 5 s entre uma e outra) e, depois, atualiza todas as listas, árvore e tags.
- Serve para quando arquivos são movidos de pasta direto no disco: a categoria é a pasta (regra do back), então a mudança aparece sem reiniciar nada. Falha na sincronização é silenciosa; o botão Reindexar da Entrada continua existindo.

## Sugestão com IA (`SuggestionPanel`)
- No topo do diálogo Adicionar/Readicionar da Entrada há o botão "Sugerir com IA" e um seletor de modelo do **Gemini** (lista de `ai/providers/gemini/models`). O padrão é "Mais barato (automático)", que não envia modelo e deixa o back escolher o de menor custo.
- Ao receber a sugestão, **substitui** título, categoria e tags do formulário (inclusive o que já estava digitado) e mostra "Sugestão preenchida com <modelo>". Nada é salvo: o usuário revisa, ajusta e só então clica em Adicionar.
- Enquanto pede, o botão e o seletor ficam desabilitados; erro mostra "Não foi possível obter a sugestão. Tente novamente." e mantém o formulário como estava.

## Seleção de categoria (`CategoryPicker`)
- Um campo por nível, aparecendo conforme o anterior é preenchido (Categoria, Subcategoria, Subcategoria 2, Subcategoria 3).
- Cada campo sugere as categorias já existentes naquele ponto da árvore (ignorando maiúscula e acento) e aceita digitar uma nova; nome que não existe mostra "Nova categoria".
- Limpar um nível limpa os mais profundos.
- Um texto explica que categoria = pasta (do mais amplo ao mais específico) e que assuntos soltos vão em tags. Com níveis preenchidos mostra "Ficará em: A › B › C".

## Prévia "Como vai ficar na biblioteca" (`DocumentPreview`)
- Aparece no Novo artigo e no diálogo Adicionar/Readicionar, atualizando enquanto o usuário digita: cartão com título, categoria, tags, trecho do conteúdo e a pasta (`biblioteca / A / B`).
- Título vazio mostra "Sem título ainda"; sem tags mostra "Sem tags".

## Tags (`TagInput`)
- Enter, vírgula ou sair do campo adiciona; tags ficam em minúsculas, sem duplicadas (ignorando acento e maiúscula). Backspace com o campo vazio remove a última; o "x" remove uma específica.
