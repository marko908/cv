"use client";

import { useState } from "react";
import { Check, Flag, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  { value: "dane", label: "Błędne lub zmyślone dane w CV" },
  { value: "jakosc", label: "Słaba jakość poprawek AI" },
  { value: "keywords", label: "Niepoprawne słowa kluczowe" },
  { value: "dopasowanie", label: "Złe dopasowanie do oferty" },
  { value: "tresc", label: "Błąd w treści lub języku" },
  { value: "pdf", label: "Problem z podglądem lub pobieraniem PDF" },
  { value: "inne", label: "Coś innego" },
];

/** Formularz zgłoszenia błędu dot. konkretnego dopasowania / wyniku AI. */
export function ReportErrorDialog({
  tailoringId,
  jobTitle,
  trigger,
}: {
  tailoringId: string;
  jobTitle: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = category && message.trim().length >= 5;

  const submit = async () => {
    if (!canSubmit) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/zglos-blad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message, tailoringId, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Nie udało się wysłać.");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Nie udało się wysłać.");
    }
  };

  const reset = () => {
    setCategory("");
    setMessage("");
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setTimeout(reset, 200);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="shadow-dialog sm:max-w-lg">
        {status === "sent" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/15">
              <Check className="size-6 text-primary" />
            </span>
            <DialogTitle className="text-lg">Dziękujemy za zgłoszenie</DialogTitle>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Przyjrzymy się temu, żeby dopasowania były coraz lepsze. Twoja
              uwaga trafiła do naszego zespołu.
            </p>
            <Button className="mt-5" onClick={() => setOpen(false)}>
              Zamknij
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <p className="eyebrow flex items-center gap-1.5 text-primary">
                <Flag className="size-3.5" />
                Zgłoś błąd
              </p>
              <DialogTitle>Coś jest nie tak z tym dopasowaniem?</DialogTitle>
              <DialogDescription>
                Wybierz, czego dotyczy problem, i opisz go krótko. Pomożesz nam
                poprawić jakość dopasowań CV.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label>Czego dotyczy problem?</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="report-msg">Opis problemu</Label>
                <Textarea
                  id="report-msg"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Opisz, co poszło nie tak - np. które dane są błędne albo która poprawka jest nietrafiona."
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-destructive">{errorMsg}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                className="btn-label gap-2 font-bold"
                disabled={!canSubmit || status === "sending"}
                onClick={submit}
              >
                {status === "sending" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Flag className="size-4" />
                )}
                {status === "sending" ? "Wysyłanie…" : "Wyślij zgłoszenie"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
