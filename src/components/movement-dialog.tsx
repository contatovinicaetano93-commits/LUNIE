"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VariantOption } from "@/lib/catalog";

export function MovementDialog({ options }: { options: VariantOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState("entrada");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: String(data.get("barcode") ?? ""),
          quantity: String(data.get("quantity") ?? ""),
          note: String(data.get("note") ?? ""),
          kind,
        }),
      });
      const payload: unknown = await response.json();
      const message =
        payload &&
        typeof payload === "object" &&
        "message" in payload &&
        typeof payload.message === "string"
          ? payload.message
          : "Não foi possível registrar.";
      if (!response.ok) {
        setError(message);
        return;
      }
      form.reset();
      setKind("entrada");
      setOpen(false);
      router.refresh();
    } catch {
      setError("O registro não respondeu.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        disabled={options.length === 0}
        onClick={() => setOpen(true)}
      >
        <PlusIcon />
        Registrar
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Entrada ou saída</DialogTitle>
          <DialogDescription>
            O registro fica neste painel e entra na conta de cobertura. Ele não
            altera o saldo no Hiper nem na Nuvemshop.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <div className="grid gap-1.5">
            <Label htmlFor="movement-kind">Tipo</Label>
            <Select value={kind} onValueChange={(value) => setKind(value ?? "entrada")}>
              <SelectTrigger id="movement-kind" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="movement-barcode">Código de barras</Label>
            <Input
              id="movement-barcode"
              name="barcode"
              list="lunie-barcodes"
              required
              placeholder="789..."
              autoComplete="off"
            />
            <datalist id="lunie-barcodes">
              {options.map((option) => (
                <option key={option.barcode} value={option.barcode}>
                  {option.label}
                </option>
              ))}
            </datalist>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="movement-quantity">Quantidade</Label>
            <Input
              id="movement-quantity"
              name="quantity"
              type="number"
              min={1}
              max={9999}
              step={1}
              required
              defaultValue={1}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="movement-note">Nota</Label>
            <Input
              id="movement-note"
              name="note"
              maxLength={180}
              placeholder="Recebimento do fornecedor, ajuste de contagem..."
            />
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando" : "Salvar registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
