import { useEffect, useRef } from "react";

import { createPortal } from "react-dom";

import { MarkdownMessage } from "#components/MarkdownMessage";
import { formatDateTime } from "#lib/format";

import type { BookReading } from "../types";
import { BookCover } from "./BookCover";

interface BookPrintViewProps {
  reading: BookReading;
  /** Chamado quando a janela de impressão fecha (salvou o PDF ou cancelou). */
  onDone: () => void;
}

/**
 * Versão do livro para imprimir / salvar como PDF: capa, sumário e cada
 * capítulo começando em página nova. Aparece fora do app (portal no body) e
 * só na impressão (ver `#print-root` em global.css); ao montar, abre a janela
 * de impressão do navegador, onde basta escolher "Salvar como PDF".
 */
export function BookPrintView({ reading, onDone }: BookPrintViewProps) {
  const { book, modules } = reading;
  const done = useRef(onDone);
  let number = 0;
  let chapterNumber = 0;

  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const previousTitle = document.title;

    // O nome sugerido para o arquivo PDF vem do título da página.
    document.title = book.title;
    document.body.classList.add("printing-book");

    const finish = () => done.current();

    window.addEventListener("afterprint", finish);

    // Dá um instante para o texto e as imagens serem desenhados.
    const timer = window.setTimeout(() => window.print(), 150);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", finish);
      document.body.classList.remove("printing-book");
      document.title = previousTitle;
    };
  }, [book.title]);

  return createPortal(
    <div id="print-root" aria-hidden>
      <section className="print-cover">
        <BookCover
          title={book.title}
          kind={book.kind}
          subtitle={book.subtitle}
          color={book.coverColor}
          imageUrl={book.coverImageUrl}
          className="mx-auto w-[11cm]"
        />

        {book.description && (
          <p className="print-description">{book.description}</p>
        )}

        <p className="print-date">
          Exportado em {formatDateTime(new Date().toISOString())}
        </p>
      </section>

      <section className="print-toc">
        <h1>Sumário</h1>

        <ol>
          {modules.map((module) => (
            <li key={module.id}>
              {module.title && <strong>{module.title}</strong>}

              <ol>
                {module.chapters.map((chapter) => {
                  number += 1;

                  return (
                    <li key={chapter.documentId}>
                      {number}. {chapter.title}
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
      </section>

      {modules.map((module) => (
        <div key={module.id}>
          {module.title && <h2 className="print-module">{module.title}</h2>}

          {module.chapters.map((chapter) => {
            chapterNumber += 1;

            return (
              <article key={chapter.documentId} className="print-chapter">
                <p className="print-chapter-label">
                  Capítulo {chapterNumber} · {chapter.title}
                </p>

                <MarkdownMessage content={chapter.content} size="base" />
              </article>
            );
          })}
        </div>
      ))}
    </div>,
    document.body,
  );
}
