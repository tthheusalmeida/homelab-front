import { useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "#ui/button";
import { Input } from "#ui/input";
import { Label } from "#ui/label";

import { buildDocumentHints } from "../hints";
import { useCreateVideoToTranscript } from "../hooks/useCreateVideoToTranscript";
import { JobDocumentFields } from "./JobDocumentFields";

interface VideoToTranscriptFormProps {
  /** Chamado quando o job foi criado (a janela usa para fechar e limpar o formulário). */
  onCreated?: () => void;
}

export function VideoToTranscriptForm({
  onCreated,
}: VideoToTranscriptFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const createJob = useCreateVideoToTranscript();
  const [sent, setSent] = useState(false);

  // Travado enquanto envia e depois de enviar: evita criar o mesmo job duas vezes.
  const locked = createJob.isPending || sent;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (locked) {
      return;
    }

    createJob.mutate(
      { url, ...buildDocumentHints({ title, category, tags }) },
      {
        onSuccess: () => {
          setSent(true);
          onCreated?.();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="video-url">URL do vídeo</Label>

        <Input
          id="video-url"
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          disabled={locked}
          required
        />

        <p className="text-sm text-muted-foreground">
          Informe a URL direta do vídeo que deseja transcrever.
        </p>
      </div>

      <JobDocumentFields
        idPrefix="transcript"
        defaultTitle="Transcrição de vídeo"
        title={title}
        onTitleChange={setTitle}
        category={category}
        onCategoryChange={setCategory}
        tags={tags}
        onTagsChange={setTags}
        disabled={locked}
      />

      {createJob.isError && (
        <p className="text-sm text-destructive">
          Não foi possível criar o job. Tente novamente.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={!url.trim() || locked}>
          {createJob.isPending && <Loader2 className="animate-spin" />}
          Criar
        </Button>
      </div>
    </form>
  );
}
