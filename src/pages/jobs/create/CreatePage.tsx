import { useState } from "react";

import { Link } from "react-router";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "#ui/dialog";
import { Button, buttonVariants } from "#ui/button";
import { Card, CardContent } from "#ui/card";

import { ErrorState } from "#components/ErrorState";
import { LoadingState } from "#components/LoadingState";

import { JobTypeList } from "./components/JobTypeList";
import { JobForm } from "./components/JobForm";
import { useJobTypes } from "./hooks/useJobsTypes";

import { type JobType } from "../types/job.types";

export function CreatePage() {
  const [selectedJobType, setSelectedJobType] = useState<JobType | null>(null);
  // Tipo do último job criado (avisa na tela depois que a janela fecha).
  const [createdLabel, setCreatedLabel] = useState<string | null>(null);

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

        {createdLabel && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-4 py-3 text-sm"
          >
            <span>
              Job criado: <strong>{createdLabel}</strong>. Acompanhe o andamento
              na tela Acompanhar.
            </span>

            <div className="flex gap-2">
              <Link
                to="/jobs/track"
                className={buttonVariants({ size: "sm", variant: "secondary" })}
              >
                Acompanhar
              </Link>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCreatedLabel(null)}
              >
                Dispensar
              </Button>
            </div>
          </div>
        )}

        <JobTypeList
          jobTypes={data}
          onSelect={(jobType) => {
            setCreatedLabel(null);
            setSelectedJobType(jobType);
          }}
        />
      </div>

      <Dialog
        open={selectedJobType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedJobType(null);
          }
        }}
      >
        <DialogContent className="max-h-[90dvh] w-full max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedJobType ? selectedJobType.label : ""}
            </DialogTitle>

            <DialogDescription>
              Preencha os dados para criar este job.
            </DialogDescription>
          </DialogHeader>

          {selectedJobType && (
            <JobForm
              jobType={selectedJobType}
              onCreated={() => {
                // Fecha a janela: ao desmontar, o formulário é descartado e a
                // próxima abertura começa limpa (sem risco de criar o job duas vezes).
                setCreatedLabel(selectedJobType.label);
                setSelectedJobType(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
