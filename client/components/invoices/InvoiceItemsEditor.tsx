"use client";

import {
  Loader2,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useCreateInvoiceItem,
  useDeleteInvoiceItem,
  useInvoiceItems,
  useUpdateInvoiceItem,
} from "@/features/invoices/hooks/useInvoiceItems";

import type {
  CreateInvoiceItemPayload,
  InvoiceItem,
  UpdateInvoiceItemPayload,
} from "@/features/invoices/types/invoiceItem.types";

import type { Invoice } from "@/features/invoices/types/invoice.types";

interface InvoiceItemsEditorProps {
  invoice: Invoice | null;
  onClose: () => void;
}

interface ItemFormState {
  serviceName: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

interface ItemFormErrors {
  serviceName?: string;
  description?: string;
  quantity?: string;
  unitPrice?: string;
}

const emptyForm: ItemFormState = {
  serviceName: "",
  description: "",
  quantity: "1",
  unitPrice: "",
};

export default function InvoiceItemsEditor({
  invoice,
  onClose,
}: InvoiceItemsEditorProps) {
  const isDraft =
    invoice?.status === "DRAFT";

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useInvoiceItems(
    invoice?.id,
  );

  const createItem =
    useCreateInvoiceItem();

  const updateItem =
    useUpdateInvoiceItem();

  const deleteItem =
    useDeleteInvoiceItem();

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState<InvoiceItem | null>(
      null,
    );

  const [form, setForm] =
    useState<ItemFormState>(
      emptyForm,
    );

  const [errors, setErrors] =
    useState<ItemFormErrors>(
      {},
    );

  const [deleteTarget, setDeleteTarget] =
    useState<InvoiceItem | null>(
      null,
    );

  useEffect(() => {
    if (!invoice) {
      return;
    }

    setFormOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
    setErrors({});
    setDeleteTarget(null);
  }, [invoice]);

  const items: InvoiceItem[] =
  data?.data ?? [];

  const subtotal =
    useMemo(
      () =>
        items.reduce(
          (
            total: number,
            item: InvoiceItem,
          ) =>
            total +
            Number(item.totalPrice),
          0,
        ),
      [items],
    );

  const isSubmitting =
    createItem.isPending ||
    updateItem.isPending;

  const closeEditor = () => {
    if (isSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
    setErrors({});
  };

  const openCreateForm = () => {
    setEditingItem(null);
    setForm({
      ...emptyForm,
    });
    setErrors({});
    setFormOpen(true);
  };

  const openEditForm = (
    item: InvoiceItem,
  ) => {
    setEditingItem(item);

    setForm({
      serviceName:
        item.serviceName,
      description:
        item.description ?? "",
      quantity:
        String(item.quantity),
      unitPrice:
        String(item.unitPrice),
    });

    setErrors({});
    setFormOpen(true);
  };

  const updateField = (
    field: keyof ItemFormState,
    value: string,
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      }),
    );

    setErrors(
      (previous) => ({
        ...previous,
        [field]: undefined,
      }),
    );
  };

  const validateForm =
    () => {
      const nextErrors: ItemFormErrors =
        {};

      const serviceName =
        form.serviceName.trim();

      const quantity =
        Number(form.quantity);

      const unitPrice =
        Number(form.unitPrice);

      if (!serviceName) {
        nextErrors.serviceName =
          "Service name is required.";
      } else if (
        serviceName.length < 2
      ) {
        nextErrors.serviceName =
          "Service name must be at least 2 characters.";
      } else if (
        serviceName.length > 150
      ) {
        nextErrors.serviceName =
          "Service name cannot exceed 150 characters.";
      }

      if (
        !Number.isInteger(
          quantity,
        ) ||
        quantity <= 0
      ) {
        nextErrors.quantity =
          "Quantity must be a positive whole number.";
      }

      if (
        !Number.isFinite(
          unitPrice,
        ) ||
        unitPrice < 0
      ) {
        nextErrors.unitPrice =
          "Unit price must be a valid non-negative amount.";
      }

      if (
        form.description.trim()
          .length > 5000
      ) {
        nextErrors.description =
          "Description cannot exceed 5000 characters.";
      }

      setErrors(
        nextErrors,
      );

      return (
        Object.keys(
          nextErrors,
        ).length === 0
      );
    };

  const handleSubmit =
    async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (!invoice || !isDraft) {
        return;
      }

      if (!validateForm()) {
        return;
      }

      const payload = {
        serviceName:
          form.serviceName.trim(),

        description:
          form.description.trim() ||
          undefined,

        quantity:
          Number(form.quantity),

        unitPrice:
          Number(form.unitPrice),
      };

      try {
        if (editingItem) {
          await updateItem.mutateAsync({
            itemId:
              editingItem.id,
            data:
              payload as UpdateInvoiceItemPayload,
          });

          toast.success(
            "Invoice item updated successfully.",
          );
        } else {
          await createItem.mutateAsync({
            invoiceId:
              invoice.id,
            data:
              payload as CreateInvoiceItemPayload,
          });

          toast.success(
            "Invoice item added successfully.",
          );
        }

        closeEditor();
      } catch (error: any) {
        const message =
          error?.response?.data
            ?.message ||
          "Unable to save invoice item.";

        toast.error(
          message,
        );
      }
    };

  const handleDelete =
    async () => {
      if (
        !deleteTarget ||
        !invoice ||
        !isDraft
      ) {
        return;
      }

      try {
        await deleteItem.mutateAsync(
          deleteTarget.id,
        );

        toast.success(
          "Invoice item deleted successfully.",
        );

        setDeleteTarget(null);
      } catch (error: any) {
        const message =
          error?.response?.data
            ?.message ||
          "Unable to delete invoice item.";

        toast.error(
          message,
        );
      }
    };

  if (!invoice) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
      <div className="my-4 flex w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:my-8">
        {/* Header */}

        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-slate-600" />

              <h2 className="text-lg font-semibold text-slate-900">
                Invoice Items
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {invoice.invoiceNumber}
              {" • "}
              {invoice.quotation
                ?.client?.companyName ??
                "Invoice"}
            </p>

            {!isDraft && (
              <p className="mt-2 text-xs font-medium text-amber-600">
                This invoice is no longer a draft. Its items are read-only.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              isSubmitting ||
              deleteItem.isPending
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close invoice items"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6">
          {/* Invoice summary */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Invoice"
              value={
                invoice.invoiceNumber
              }
            />

            <SummaryCard
              label="Status"
              value={formatInvoiceStatus(
                invoice.status,
              )}
            />

            <SummaryCard
              label="Current Total"
              value={formatCurrency(
                invoice.totalAmount,
              )}
            />
          </div>

          {/* Error */}

          {isError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">
                Unable to load invoice items.
              </p>

              <button
                type="button"
                onClick={() =>
                  refetch()
                }
                className="mt-2 text-sm font-medium text-red-700 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading */}

          {isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading invoice items...
              </div>
            </div>
          ) : (
            <>
              {/* Items header */}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Line Items
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {items.length}{" "}
                    {items.length === 1
                      ? "item"
                      : "items"}
                    {" • "}
                    {isFetching &&
                      "Refreshing..."}
                  </p>
                </div>

                {isDraft && (
                  <button
                    type="button"
                    onClick={
                      openCreateForm
                    }
                    disabled={
                      isSubmitting ||
                      deleteItem.isPending
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </button>
                )}
              </div>

              {/* Add / Edit form */}

              {formOpen &&
                isDraft && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {editingItem
                            ? "Edit Invoice Item"
                            : "Add Invoice Item"}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          Enter the service and pricing details.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          closeEditor
                        }
                        disabled={
                          isSubmitting
                        }
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-600"
                        aria-label="Close item form"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={
                        handleSubmit
                      }
                      className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                      {/* Service */}

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="invoiceItemService"
                          className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                          Service Name
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <input
                          id="invoiceItemService"
                          type="text"
                          value={
                            form.serviceName
                          }
                          onChange={(
                            event,
                          ) =>
                            updateField(
                              "serviceName",
                              event.target
                                .value,
                            )
                          }
                          maxLength={
                            150
                          }
                          autoFocus
                          disabled={
                            isSubmitting
                          }
                          placeholder="e.g. Website Development"
                          className={inputClass(
                            errors.serviceName,
                          )}
                        />

                        <FieldError
                          message={
                            errors.serviceName
                          }
                        />
                      </div>

                      {/* Description */}

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="invoiceItemDescription"
                          className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                          Description
                          <span className="ml-1 font-normal text-slate-400">
                            (Optional)
                          </span>
                        </label>

                        <textarea
                          id="invoiceItemDescription"
                          value={
                            form.description
                          }
                          onChange={(
                            event,
                          ) =>
                            updateField(
                              "description",
                              event.target
                                .value,
                            )
                          }
                          rows={3}
                          maxLength={
                            5000
                          }
                          disabled={
                            isSubmitting
                          }
                          placeholder="Describe the service..."
                          className={`${inputClass()} resize-none`}
                        />

                        <div className="mt-1 flex justify-between">
                          <FieldError
                            message={
                              errors.description
                            }
                          />

                          <span className="text-xs text-slate-400">
                            {
                              form
                                .description
                                .length
                            }
                            /5000
                          </span>
                        </div>
                      </div>

                      {/* Quantity */}

                      <div>
                        <label
                          htmlFor="invoiceItemQuantity"
                          className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                          Quantity
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <input
                          id="invoiceItemQuantity"
                          type="number"
                          min="1"
                          step="1"
                          value={
                            form.quantity
                          }
                          onChange={(
                            event,
                          ) =>
                            updateField(
                              "quantity",
                              event.target
                                .value,
                            )
                          }
                          disabled={
                            isSubmitting
                          }
                          className={inputClass(
                            errors.quantity,
                          )}
                        />

                        <FieldError
                          message={
                            errors.quantity
                          }
                        />
                      </div>

                      {/* Unit Price */}

                      <div>
                        <label
                          htmlFor="invoiceItemUnitPrice"
                          className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                          Unit Price
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <input
                          id="invoiceItemUnitPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            form.unitPrice
                          }
                          onChange={(
                            event,
                          ) =>
                            updateField(
                              "unitPrice",
                              event.target
                                .value,
                            )
                          }
                          disabled={
                            isSubmitting
                          }
                          placeholder="0.00"
                          className={inputClass(
                            errors.unitPrice,
                          )}
                        />

                        <FieldError
                          message={
                            errors.unitPrice
                          }
                        />
                      </div>

                      {/* Preview */}

                      <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            Line Total
                          </span>

                          <span className="text-base font-semibold text-slate-900">
                            {formatCurrency(
                              Number(
                                form.quantity,
                              ) *
                                Number(
                                  form.unitPrice,
                                ),
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Form actions */}

                      <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={
                            closeEditor
                          }
                          disabled={
                            isSubmitting
                          }
                          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={
                            isSubmitting
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              {editingItem ? (
                                <Pencil className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}

                              {editingItem
                                ? "Save Changes"
                                : "Add Item"}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              {/* Empty state */}

              {items.length === 0 ? (
                <div className="mt-5 flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                    <ReceiptText className="h-6 w-6 text-slate-400" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    No invoice items
                  </h3>

                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    {isDraft
                      ? "Add at least one item before sending this invoice."
                      : "This invoice does not contain any line items."}
                  </p>

                  {isDraft && (
                    <button
                      type="button"
                      onClick={
                        openCreateForm
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Item
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop table */}

                  <div className="mt-5 hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Service
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Quantity
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Unit Price
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Total
                          </th>

                          {isDraft && (
                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {items.map(
                          (
                            item: InvoiceItem,
                          ) => (
                            <tr
                              key={
                                item.id
                              }
                              className="hover:bg-slate-50"
                            >
                              <td className="px-5 py-4">
                                <p className="text-sm font-medium text-slate-900">
                                  {
                                    item.serviceName
                                  }
                                </p>

                                {item.description && (
                                  <p className="mt-1 max-w-[350px] truncate text-xs text-slate-400">
                                    {
                                      item.description
                                    }
                                  </p>
                                )}
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {
                                  item.quantity
                                }
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {formatCurrency(
                                  item.unitPrice,
                                )}
                              </td>

                              <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                {formatCurrency(
                                  item.totalPrice,
                                )}
                              </td>

                              {isDraft && (
                                <td className="px-5 py-4">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditForm(
                                          item,
                                        )
                                      }
                                      disabled={
                                        isSubmitting ||
                                        deleteItem.isPending
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                                      title="Edit item"
                                      aria-label="Edit item"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDeleteTarget(
                                          item,
                                        )
                                      }
                                      disabled={
                                        isSubmitting ||
                                        deleteItem.isPending
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                      title="Delete item"
                                      aria-label="Delete item"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile list */}

                  <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 md:hidden">
                    {items.map(
                      (
                        item: InvoiceItem,
                      ) => (
                        <div
                          key={
                            item.id
                          }
                          className="p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h4 className="truncate text-sm font-semibold text-slate-900">
                                {
                                  item.serviceName
                                }
                              </h4>

                              {item.description && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {
                                    item.description
                                  }
                                </p>
                              )}
                            </div>

                            {isDraft && (
                              <div className="flex shrink-0 gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditForm(
                                      item,
                                    )
                                  }
                                  disabled={
                                    isSubmitting ||
                                    deleteItem.isPending
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                                  aria-label="Edit item"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget(
                                      item,
                                    )
                                  }
                                  disabled={
                                    isSubmitting ||
                                    deleteItem.isPending
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                                  aria-label="Delete item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-3">
                            <SummaryField
                              label="Qty"
                              value={String(
                                item.quantity,
                              )}
                            />

                            <SummaryField
                              label="Unit"
                              value={formatCurrency(
                                item.unitPrice,
                              )}
                            />

                            <SummaryField
                              label="Total"
                              value={formatCurrency(
                                item.totalPrice,
                              )}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </>
              )}

              {/* Totals */}

              <div className="mt-5 ml-auto w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="space-y-3">
                  <SummaryRow
                    label="Items Subtotal"
                    value={formatCurrency(
                      subtotal,
                    )}
                  />

                  <SummaryRow
                    label="Invoice Discount"
                    value={`- ${formatCurrency(
                      invoice.discount,
                    )}`}
                  />

                  <SummaryRow
                    label="Invoice Tax"
                    value={formatCurrency(
                      invoice.tax,
                    )}
                  />

                  <div className="border-t border-slate-200 pt-3">
                    <SummaryRow
                      label="Invoice Total"
                      value={formatCurrency(
                        invoice.totalAmount,
                      )}
                      strong
                    />
                  </div>
                </div>
              </div>

              {/* Footer note */}

              {isDraft && (
                <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-xs leading-5 text-blue-700">
                    Changes to invoice items automatically recalculate the invoice subtotal, total amount, and balance due on the server.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}

        <div className="flex shrink-0 justify-end border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isSubmitting ||
              deleteItem.isPending
            }
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Done
          </button>
        </div>
      </div>

      {/* Delete confirmation */}

      {deleteTarget && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Delete invoice item?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Are you sure you want to remove{" "}
                <span className="font-medium text-slate-700">
                  {
                    deleteTarget.serviceName
                  }
                </span>
                ? This will recalculate the invoice totals.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null,
                  )
                }
                disabled={
                  deleteItem.isPending
                }
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDelete
                }
                disabled={
                  deleteItem.isPending
                }
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteItem.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary card                                                               */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary field                                                              */
/* -------------------------------------------------------------------------- */

function SummaryField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary row                                                                */
/* -------------------------------------------------------------------------- */

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "text-sm font-semibold text-slate-900"
            : "text-sm text-slate-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-bold text-slate-900"
            : "text-sm font-medium text-slate-700"
        }
      >
        {value}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Input                                                                       */
/* -------------------------------------------------------------------------- */

function inputClass(
  error?: string,
) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
  } disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70`;
}

/* -------------------------------------------------------------------------- */
/* Error                                                                       */
/* -------------------------------------------------------------------------- */

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* Currency                                                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(
  value: string | number,
) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount,
    )
  ) {
    return "PKR 0.00";
  }

  return new Intl.NumberFormat(
    "en-PK",
    {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(amount);
}

/* -------------------------------------------------------------------------- */
/* Status                                                                      */
/* -------------------------------------------------------------------------- */

function formatInvoiceStatus(
  status: Invoice["status"],
) {
  switch (status) {
    case "DRAFT":
      return "Draft";

    case "SENT":
      return "Sent";

    case "PARTIALLY_PAID":
      return "Partially Paid";

    case "PAID":
      return "Paid";

    case "OVERDUE":
      return "Overdue";

    default:
      return status;
  }
}