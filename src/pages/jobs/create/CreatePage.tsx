import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "#ui/dialog";
import { Card, CardContent } from "#ui/card";

import { ErrorState } from "#components/ErrorState";
import { LoadingState } from "#components/LoadingState";

import { JobTypeList } from "./components/JobTypeList";
import { JobForm } from "./components/JobForm";
import { useJobTypes } from "./hooks/useJobsTypes";

import { JobNameLabels, type JobType } from "../types/job.types";

export function CreatePage() {
  const [selectedJobType, setSelectedJobType] = useState<JobType | null>(null);

  const { data, isLoading, isError } = useJobTypes();

  if (isLoading) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center">
        <LoadingState message="Carregando" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <ErrorState
            primaryMessage="Oops! houve uma falha ao carregar os tipos de jobs."
            secondaryMessage="Tente novamente mais tarde."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Criar</h1>

          <p className="text-sm text-muted-foreground">
            Selecione o tipo de job que deseja executar.
          </p>
        </div>

        <JobTypeList jobTypes={data} onSelect={setSelectedJobType} />
      </div>

      <Dialog
        open={selectedJobType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedJobType(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedJobType ? JobNameLabels[selectedJobType.type] : ""}
            </DialogTitle>

            <DialogDescription>
              Preencha os dados para criar este job.
            </DialogDescription>
          </DialogHeader>

          {selectedJobType && <JobForm jobType={selectedJobType} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
