import { Badge } from "#ui/badge";

interface TagBadgesProps {
  tags: string[];
  /** Quantas tags aparecem; as outras viram "+N" (com a lista completa no title). */
  max?: number;
}

export function TagBadges({ tags, max = 3 }: TagBadgesProps) {
  const shown = tags.slice(0, max);
  const rest = tags.slice(max);

  return (
    <>
      {shown.map((tag) => (
        <Badge key={tag} variant="outline">
          {tag}
        </Badge>
      ))}

      {rest.length > 0 && (
        <Badge variant="secondary" title={rest.join(", ")}>
          +{rest.length}
        </Badge>
      )}
    </>
  );
}
