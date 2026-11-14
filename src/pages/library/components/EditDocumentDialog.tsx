import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#ui/dialog";

import type { DocumentDetail } from "../types/library.types";

import { EditDocumentForm } from "./EditDocumentForm";

interface EditDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentDetail;
}

/** Janela de edição do documento; fecha ao salvar ou cancelar. */
export function EditDocumentDialog({
  open,
  onOpenChange,
  document,
}: EditDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Editar página</DialogTitle>

          <DialogDescription>
            Mudar título ou categoria também renomeia ou move o arquivo. Use
            Imagem e Tabela para inserir esses elementos no texto.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <EditDocumentForm
            document={document}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
