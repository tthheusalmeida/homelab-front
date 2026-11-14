import type { BookDetail, ModuleDraft } from "./types";

/** Cópia editável da estrutura do livro (só ids de documentos). */
export function toDrafts(book: BookDetail): ModuleDraft[] {
  return book.modules.map((module) => ({
    id: module.id,
    title: module.title,
    documentIds: module.chapters.map((chapter) => chapter.documentId),
  }));
}

function locate(modules: ModuleDraft[], documentId: string) {
  for (const [moduleIndex, module] of modules.entries()) {
    const chapterIndex = module.documentIds.indexOf(documentId);

    if (chapterIndex >= 0) {
      return { moduleIndex, chapterIndex };
    }
  }

  return null;
}

/**
 * Solta um capítulo na posição `index` (da lista atual) do módulo de destino,
 * tirando-o de onde estava. Na mesma lista, a posição já considera a saída.
 */
export function dropChapter(
  modules: ModuleDraft[],
  documentId: string,
  targetModuleId: string,
  index: number,
): ModuleDraft[] {
  const at = locate(modules, documentId);
  const target = modules.find((module) => module.id === targetModuleId);

  if (!at || !target) {
    return modules;
  }

  const sameModule = modules[at.moduleIndex].id === targetModuleId;
  let position = Math.min(Math.max(index, 0), target.documentIds.length);

  if (sameModule && at.chapterIndex < position) {
    position -= 1;
  }

  if (sameModule && at.chapterIndex === position) {
    return modules;
  }

  return modules.map((module) => {
    const without = module.documentIds.filter((id) => id !== documentId);

    if (module.id !== targetModuleId) {
      return { ...module, documentIds: without };
    }

    return {
      ...module,
      documentIds: [
        ...without.slice(0, position),
        documentId,
        ...without.slice(position),
      ],
    };
  });
}

/** Solta um módulo na posição `index` da lista atual de módulos. */
export function dropModule(
  modules: ModuleDraft[],
  moduleId: string,
  index: number,
): ModuleDraft[] {
  const from = modules.findIndex((module) => module.id === moduleId);

  if (from < 0) {
    return modules;
  }

  let position = Math.min(Math.max(index, 0), modules.length);

  if (from < position) {
    position -= 1;
  }

  if (position === from) {
    return modules;
  }

  const next = modules.filter((module) => module.id !== moduleId);

  next.splice(position, 0, modules[from]);

  return next;
}

/** Metade de cima do alvo = antes; metade de baixo = depois. */
export function dropSide(
  clientY: number,
  rect: { top: number; height: number },
): "before" | "after" {
  return clientY < rect.top + rect.height / 2 ? "before" : "after";
}

/** Remove o capítulo do livro (o documento continua na biblioteca). */
export function removeChapter(
  modules: ModuleDraft[],
  documentId: string,
): ModuleDraft[] {
  return modules.map((module) => ({
    ...module,
    documentIds: module.documentIds.filter((id) => id !== documentId),
  }));
}

/** Acrescenta documentos ao fim do último módulo, ignorando os que já estão. */
export function addChapters(
  modules: ModuleDraft[],
  documentIds: string[],
): ModuleDraft[] {
  const present = new Set(modules.flatMap((module) => module.documentIds));
  const fresh = documentIds.filter((id) => !present.has(id));

  if (fresh.length === 0 || modules.length === 0) {
    return modules;
  }

  return modules.map((module, index) =>
    index === modules.length - 1
      ? { ...module, documentIds: [...module.documentIds, ...fresh] }
      : module,
  );
}

export function addModule(
  modules: ModuleDraft[],
  id: string,
  title = "Novo módulo",
): ModuleDraft[] {
  return [...modules, { id, title, documentIds: [] }];
}

export function renameModule(
  modules: ModuleDraft[],
  moduleId: string,
  title: string,
): ModuleDraft[] {
  return modules.map((module) =>
    module.id === moduleId ? { ...module, title } : module,
  );
}

/**
 * Remove um módulo; os capítulos dele vão para o módulo anterior (ou para o
 * seguinte, se for o primeiro). Com um módulo só, não remove.
 */
export function removeModule(
  modules: ModuleDraft[],
  moduleId: string,
): ModuleDraft[] {
  const index = modules.findIndex((module) => module.id === moduleId);

  if (index < 0 || modules.length <= 1) {
    return modules;
  }

  const removed = modules[index];
  const receiverIndex = index > 0 ? index - 1 : 1;

  return modules
    .map((module, position) =>
      position === receiverIndex
        ? {
            ...module,
            documentIds:
              index > 0
                ? [...module.documentIds, ...removed.documentIds]
                : [...removed.documentIds, ...module.documentIds],
          }
        : module,
    )
    .filter((_, position) => position !== index);
}

/** O que mudou em relação ao livro salvo? (para habilitar "Salvar") */
export function sameStructure(a: ModuleDraft[], b: ModuleDraft[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
