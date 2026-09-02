import { useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "#ui/button";
import { Input } from "#ui/input";
import { Label } from "#ui/label";

import { useCreateVideoToTranscript } from "../hooks/useCreateVideoToTranscript";

export function VideoTranscriptForm() {
  const [url, setUrl] = useState("");

  const createJob = useCreateVideoToTranscript();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createJob.mutate(url);
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
          disabled={createJob.isPending}
          required
        />

        <p className="text-sm text-muted-foreground">
          Informe a URL direta do vídeo que deseja transcrever.
        </p>
      </div>

      {createJob.isError && (
        <p className="text-sm text-destructive">
          Não foi possível criar o job. Tente novamente.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={!url.trim() || createJob.isPending}>
          {createJob.isPending && <Loader2 className="animate-spin" />}
          Criar
        </Button>
      </div>
    </form>
  );
}
