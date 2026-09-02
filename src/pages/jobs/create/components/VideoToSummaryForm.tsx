import { useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "#ui/button";
import { Input } from "#ui/input";
import { Label } from "#ui/label";

import { useAiModels } from "../../../ai/chat/hooks/useAiModels";
import { useAiProviders } from "../../../ai/chat/hooks/useAiProviders";
import { useAiThinking } from "../../../ai/chat/hooks/useAiThinking";
import { useCreateVideoToSummary } from "../hooks/useCreateVideoToSummary";
// TODO ChatSettingsSelect -> Create a component to select provider, model and thinking instead of use Chat Settings Select
import { ChatSettingsSelect } from "../../../ai/chat/components/ChatSettingsSelect";

export function VideoToSummaryForm() {
  const [url, setUrl] = useState("");
  const [providerId, setProviderId] = useState<string>();
  const [modelId, setModelId] = useState<string>();
  const [thinkingId, setThinkingId] = useState<string>();

  const { data: providers = [], isLoading: isLoadingProviders } =
    useAiProviders();

  const { data: models = [], isLoading: isLoadingModels } =
    useAiModels(providerId);

  const { data: thinkingOptions = [], isLoading: isLoadingThinking } =
    useAiThinking({
      providerId,
      modelId,
    });

  const createJob = useCreateVideoToSummary();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!providerId || !modelId || !thinkingId) {
      return;
    }

    createJob.mutate({
      url,
      providerId,
      modelId,
      thinking: thinkingId,
    });
  };

  const handleProviderChange = (value: string | null) => {
    setProviderId(value ?? undefined);
    setModelId(undefined);
    setThinkingId(undefined);
  };

  const handleModelChange = (value: string | null) => {
    setModelId(value ?? undefined);
    setThinkingId(undefined);
  };

  const handleThinkingChange = (value: string | null) => {
    setThinkingId(value ?? undefined);
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
          Informe a URL direta do vídeo que deseja resumir.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ChatSettingsSelect
          value={providerId}
          options={providers}
          placeholder="Provedor"
          label="Provedor"
          triggerWidth="w-32"
          contentWidth="w-32"
          disabled={isLoadingProviders || createJob.isPending}
          onValueChange={handleProviderChange}
        />

        <ChatSettingsSelect
          value={modelId}
          options={models}
          placeholder="Modelo"
          label="Modelo"
          triggerWidth="w-40"
          contentWidth="w-md"
          disabled={!providerId || isLoadingModels || createJob.isPending}
          onValueChange={handleModelChange}
        />

        <ChatSettingsSelect
          value={thinkingId}
          options={thinkingOptions}
          placeholder="Thinking"
          label="Thinking"
          triggerWidth="w-32"
          contentWidth="w-40"
          disabled={!modelId || isLoadingThinking || createJob.isPending}
          onValueChange={handleThinkingChange}
        />
      </div>

      {createJob.isError && (
        <p className="text-sm text-destructive">
          Não foi possível criar o job. Tente novamente.
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={
            !url.trim() ||
            !providerId ||
            !modelId ||
            !thinkingId ||
            createJob.isPending
          }
        >
          {createJob.isPending && <Loader2 className="animate-spin" />}
          Criar
        </Button>
      </div>
    </form>
  );
}
