"use client";

import * as React from "react";
import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Check, Loader2 } from "lucide-react";
import { updatePreEnrollmentStatus } from "@/app/actions/update-pre-enrollment-status";

type PreStatus = "realizada" | "em_conversas" | "finalizado" | "cancelado";

const LABEL: Record<PreStatus, string> = {
  realizada: "Realizada",
  em_conversas: "Em conversas",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const COLORS: Record<PreStatus, string> = {
  realizada: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  em_conversas: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  finalizado: "bg-green-100 text-green-700 hover:bg-green-100",
  cancelado: "bg-red-100 text-red-700 hover:bg-red-100",
};

export default function StatusBadgeMenuEnrollment(props: {
  id: number;
  status: PreStatus;
  onChanged?: (s: PreStatus) => void;
}) {
  const qc = useQueryClient();
  const [status, setStatus] = React.useState<PreStatus>(props.status);
  const [pending, startTransition] = useTransition();

  const changeTo = (next: PreStatus) => {
    if (next === status) return;
    const prev = status;
    setStatus(next); // otimista

    startTransition(async () => {
      const res = await updatePreEnrollmentStatus({
        id: props.id,
        status: next,
      });
      if (res.success) {
        props.onChanged?.(next);
        // refetch da lista que alimenta a tabela
        qc.invalidateQueries({ queryKey: ["enrollment"] });
      } else {
        setStatus(prev);
        alert("Não foi possível atualizar o status.");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition ${COLORS[status]}`}
          disabled={pending}
          title="Alterar status"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4 opacity-70" />
          )}
          {LABEL[status]}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Alterar status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(LABEL) as PreStatus[]).map((k) => (
          <DropdownMenuItem
            key={k}
            onClick={() => changeTo(k)}
            className="cursor-pointer"
          >
            {LABEL[k]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
