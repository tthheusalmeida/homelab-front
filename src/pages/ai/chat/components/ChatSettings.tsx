import type { AiModel, AiProvider, AiThinkingOption } from "../types/chat";

import { ChatSettingsSelect } from "./ChatSettingsSelect";

interface ChatSettingsProps {
  providers: AiProvider[];
  models: AiModel[];
  thinkingOptions: AiThinkingOption[];

  providerId?: string;
  modelId?: string;
  thinkingId?: string;

  onProviderChange: (value: string | null) => void;
  onModelChange: (value: string | null) => void;
  onThinkingChange: (value: string | null) => void;

  isLoadingModels?: boolean;
  isLoadingThinking?: boolean;
}

export function ChatSettings({
  providers,
  models,
  thinkingOptions,
  providerId,
  modelId,
  thinkingId,
  onProviderChange,
  onModelChange,
  onThinkingChange,
  isLoadingModels,
  isLoadingThinking,
}: ChatSettingsProps) {
  return (
    <div className="flex items-center gap-2">
      <ChatSettingsSelect
        value={providerId}
        options={providers}
        placeholder="Provedor"
        label="Provedor"
        triggerWidth="w-32"
        contentWidth="w-32"
        onValueChange={onProviderChange}
      />

      <ChatSettingsSelect
        value={modelId}
        options={models}
        placeholder="Modelo"
        label="Modelo"
        triggerWidth="w-40"
        contentWidth="w-md"
        disabled={!providerId || isLoadingModels}
        onValueChange={onModelChange}
      />

      <ChatSettingsSelect
        value={thinkingId}
        options={thinkingOptions}
        placeholder="Thinking"
        triggerWidth="w-32"
        contentWidth="w-40"
        disabled={!modelId || isLoadingThinking}
        onValueChange={onThinkingChange}
      />
    </div>
  );
}
