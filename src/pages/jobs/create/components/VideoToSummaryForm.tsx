import { useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "#ui/button";
import { Input } from "#ui/input";
import { Label } from "#ui/label";

import { useAiModels } from "../../../ai/chat/hooks/useAiModels";
import { useAiProviders } from "../../../ai/chat/hooks/useAiProviders";
import { useAiThinking } from "../../../ai/chat/hooks/useAiThinking";
import { buildDocumentHints } from "../hints";
import {
  DEFAULT_SUMMARY_DETAIL,
  isSummaryDetail,
  summaryDetailOptions,
  type SummaryDetail,
} from "../summary-detail";
import { useCreateVideoToSummary } from "../hooks/useCreateVideoToSummary";
import { JobDocumentFields } from "./JobDocumentFields";
import { OptionSelect } from "#components/OptionSelect";

interface VideoToSummaryFormProps {
  /** Chamado quando o job foi criado (a janela usa para fechar e limpar o formulário). */
  onCreated?: () => void;
}

export function VideoToSummaryForm({ onCreated }: VideoToSummaryFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [providerId, setProviderId] = useState<string>();
  const [modelId, setModelId] = useState<string>();
  const [thinkingId, setThinkingId] = useState<string>();
  const [detail, setDetail] = useState<SummaryDetail>(DEFAULT_SUMMARY_DETAIL);

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
  const [sent, setSent] = useState(false);

  // Travado enquanto envia e depois de enviar: evita criar o mesmo job duas vezes.
  const locked = createJob.isPending || sent;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!providerId || !modelId || !thinkingId) {
      return;
    }

    if (locked) {
      return;
    }

    createJob.mutate(
      {
        url,
        providerId,
        modelId,
        thinking: thinkingId,
        detail,
        ...buildDocumentHints({ title, category, tags }),
      },
      {
        onSuccess: () => {
          setSent(true);
          onCreated?.();
        },
      },
    );
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
          disabled={locked}
          required
        />

        <p className="text-sm text-muted-foreground">
          Informe a URL direta do vídeo que deseja resumir.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <OptionSelect
          value={providerId}
          options={providers}
          placeholder="Provedor"
          label="Provedor"
          triggerWidth="w-32"
          contentWidth="w-32"
          disabled={isLoadingProviders || locked}
          onValueChange={handleProviderChange}
        />

        <OptionSelect
          value={modelId}
          options={models}
          placeholder="Modelo"
          label="Modelo"
          triggerWidth="w-40"
          contentWidth="w-md"
          disabled={!providerId || isLoadingModels || locked}
          onValueChange={handleModelChange}
        />

        <OptionSelect
          value={thinkingId}
          options={thinkingOptions}
          placeholder="Thinking"
          label="Thinking"
          triggerWidth="w-32"
          contentWidth="w-40"
          disabled={!modelId || isLoadingThinking || locked}
          onValueChange={handleThinkingChange}
        />
      </div>

      <div className="space-y-2">
        <OptionSelect
          value={detail}
          options={summaryDetailOptions}
          placeholder="Nível de detalhe"
          label="Nível de detalhe"
          triggerWidth="w-48"
          contentWidth="w-52"
          disabled={locked}
          onValueChange={(value) =>
            setDetail(isSummaryDetail(value) ? value : DEFAULT_SUMMARY_DETAIL)
          }
        />

        <p className="text-sm text-muted-foreground">
          {
            summaryDetailOptions.find((option) => option.id === detail)
              ?.description
          }
        </p>
      </div>

      <JobDocumentFields
        idPrefix="summary"
        defaultTitle="Resumo de vídeo"
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
        <Button
          type="submit"
          disabled={
            !url.trim() || !providerId || !modelId || !thinkingId || locked
          }
        >
          {createJob.isPending && <Loader2 className="animate-spin" />}
          Criar
        </Button>
      </div>
    </form>
  );
}
