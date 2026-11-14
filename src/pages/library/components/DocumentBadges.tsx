import { Badge } from "#ui/badge";

import {
  documentTypeLabels,
  type DocumentStatus,
  type DocumentType,
} from "../types/library.types";

export function DocumentTypeBadge({ type }: { type: DocumentType }) {
  return <Badge variant="secondary">{documentTypeLabels[type]}</Badge>;
}

const statusLabels: Record<DocumentStatus, string> = {
  pending: "Pendente",
  published: "Na biblioteca",
  archived: "Removido",
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <Badge variant={status === "published" ? "default" : "outline"}>
      {statusLabels[status]}
    </Badge>
  );
}
