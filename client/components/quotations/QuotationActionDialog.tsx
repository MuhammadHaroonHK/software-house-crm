"use client";

import {
  CheckCircle2,
  FileCheck2,
  Loader2,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import type {
  Quotation,
  QuotationStatus,
} from "@/features/quotations/types/quotation.types";

export type QuotationAction =
  | "SEND"
  | "ACCEPT"
  | "REJECT"
  | "EXPIRE"
  | "DELETE";

interface QuotationActionDialogProps {
  quotation: Quotation | null;
  action: QuotationAction | null;
  isProcessing?: boolean;

  onCancel: () => void;
  onConfirm: () => void;
}

export default function QuotationActionDialog({
  quotation,
  action,
  isProcessing = false,
  onCancel,
  onConfirm,
}: QuotationActionDialogProps) {
  if (!quotation || !action) {
    return null;
  }

  const config =
    getActionConfig(action);

  const Icon =
    config.icon;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${config.iconBackground}`}
        >
          <Icon
            className={`h-5 w-5 ${config.iconColor}`}
          />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          {config.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {config.description}{" "}
          <span className="font-medium text-slate-700">
            {quotation.quotationNumber}
          </span>
          .
        </p>

        {action === "DELETE" && (
          <p className="mt-2 text-sm font-medium text-red-600">
            This action cannot be undone.
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={
              isProcessing
            }
            onClick={
              onCancel
            }
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>

          <button
            type="button"
            disabled={
              isProcessing
            }
            onClick={
              onConfirm
            }
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${config.buttonClass}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icon className="h-4 w-4" />
                {config.actionLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function getActionConfig(
  action: QuotationAction
) {
  switch (action) {
    case "SEND":
      return {
        title: "Send Quotation?",
        description:
          "This will lock the quotation and move it from Draft to Sent.",
        actionLabel: "Send Quotation",
        icon: Send,
        iconBackground:
          "bg-blue-50",
        iconColor:
          "text-blue-600",
        buttonClass:
          "bg-blue-600 hover:bg-blue-700",
      };

    case "ACCEPT":
      return {
        title: "Accept Quotation?",
        description:
          "This will mark the quotation as accepted.",
        actionLabel: "Accept",
        icon: CheckCircle2,
        iconBackground:
          "bg-emerald-50",
        iconColor:
          "text-emerald-600",
        buttonClass:
          "bg-emerald-600 hover:bg-emerald-700",
      };

    case "REJECT":
      return {
        title: "Reject Quotation?",
        description:
          "This will mark the quotation as rejected.",
        actionLabel: "Reject",
        icon: XCircle,
        iconBackground:
          "bg-red-50",
        iconColor:
          "text-red-600",
        buttonClass:
          "bg-red-600 hover:bg-red-700",
      };

    case "EXPIRE":
      return {
        title: "Mark Quotation Expired?",
        description:
          "This will permanently move the quotation to the Expired state.",
        actionLabel: "Mark Expired",
        icon: FileCheck2,
        iconBackground:
          "bg-amber-50",
        iconColor:
          "text-amber-600",
        buttonClass:
          "bg-amber-600 hover:bg-amber-700",
      };

    case "DELETE":
      return {
        title: "Delete Quotation?",
        description:
          "You are about to delete quotation",
        actionLabel: "Delete",
        icon: Trash2,
        iconBackground:
          "bg-red-50",
        iconColor:
          "text-red-600",
        buttonClass:
          "bg-red-600 hover:bg-red-700",
      };
  }
}