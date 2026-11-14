import { useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "#ui/button";
import { Input } from "#ui/input";
import { Label } from "#ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#ui/dialog";

import { CategoryPicker } from "#components/CategoryPicker";
import { TagInput } from "#components/TagInput";

import { useCategories, usePublishDocument } from "../hooks/useLibrary";
import { DocumentPreview } from "./DocumentPreview";
import type { DocumentSummary } from "../types/library.types";

interface PublishDialogProps {
  /** Documento a adicionar; `null` mantém o diálogo fechado. */
  document: DocumentSummary | null;
  onOpenChange: (open: boolean) => void;
}

export function PublishDialog({ document, onOpenChange }: PublishDialogProps) {
  return (
    <Dialog open={document !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {document && (
          <PublishForm
            key={document.id}
            document={document}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface PublishFormProps {
  document: DocumentSummary;
  onDone: () => void;
}

function PublishForm({ document, onDone }: PublishFormProps) {
  const [title, setTitle] = useState(document.title);
  const [category, setCategory] = useState(document.category);
  const [tags, setTags] = useState(document.tags);

  const categories = useCategories();
  const publish = usePublishDocument();

  const isReadd = document.status === "archived";
  const canSubmit =
    title.trim() !== "" && category.length > 0 && !publish.isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    publish.mutate(
      { id: document.id, input: { title: title.trim(), category, tags } },
      { onSuccess: onDone },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <DialogHeader>
        <DialogTitle>
          {isReadd ? "Readicionar à biblioteca" : "Adicionar à biblioteca"}
        </DialogTitle>

        <DialogDescription>
          Escolha a pasta (categoria, até 4 níveis) e as tags. Abaixo você vê
          como o documento vai aparecer.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="publish-title">Título</Label>

        <Input
          id="publish-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={publish.isPending}
        />
      </div>

      <CategoryPicker
        value={category}
        onChange={setCategory}
        options={categories.data ?? []}
        disabled={publish.isPending}
      />

      <div className="space-y-2">
        <Label>Tags</Label>

        <p className="text-sm text-muted-foreground">
          Etiquetas livres para achar o documento na busca, independentes da
          pasta. Ex.: docker, prova, revisar.
        </p>

        <TagInput value={tags} onChange={setTags} disabled={publish.isPending} />
      </div>

      <DocumentPreview
        title={title}
        category={category}
        tags={tags}
        excerpt={document.preview}
      />

      {publish.isError && (
        <p className="text-sm text-destructive">
          Não foi possível adicionar. Verifique a categoria e tente novamente.
        </p>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={publish.isPending}
          onClick={onDone}
        >
          Cancelar
        </Button>

        <Button type="submit" disabled={!canSubmit}>
          {publish.isPending && <Loader2 className="animate-spin" />}
          {isReadd ? "Readicionar" : "Adicionar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
