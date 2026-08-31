import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "#ui/select";

interface ChatSettingsOption {
  id: string;
  label: string;
}

interface ChatSettingsSelectProps {
  value?: string;
  options: ChatSettingsOption[];
  placeholder: string;
  label?: string;

  triggerWidth?: string;
  contentWidth?: string;

  disabled?: boolean;
  onValueChange: (value: string | null) => void;
}

export function ChatSettingsSelect({
  value,
  options,
  placeholder,
  label,
  triggerWidth = "w-32",
  contentWidth = "w-48",
  disabled,
  onValueChange,
}: ChatSettingsSelectProps) {
  const selectedOption = options.find((option) => option.id === value);

  return (
    <Select
      value={value ?? null}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={`h-8 ${triggerWidth} border-0 bg-muted/50 shadow-none`}
      >
        <SelectValue placeholder={placeholder}>
          {selectedOption?.label}
        </SelectValue>
      </SelectTrigger>

      <SelectContent className={contentWidth}>
        <SelectGroup>
          {label && <SelectLabel>{label}</SelectLabel>}

          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
