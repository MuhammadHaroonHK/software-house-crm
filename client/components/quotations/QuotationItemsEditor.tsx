"use client";

import {
  Calculator,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useCreateQuotationItem,
  useDeleteQuotationItem,
  useQuotationItems,
  useUpdateQuotationItem,
} from "@/features/quotations/hooks/useQuotationItems";

import type {
  Quotation,
  QuotationItem,
} from "@/features/quotations/types/quotation.types";

interface QuotationItemsEditorProps {
  quotation: Quotation | null;
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
  quantity?: string;
  unitPrice?: string;
}

const emptyForm: ItemFormState = {
  serviceName: "",
  description: "",
  quantity: "1",
  unitPrice: "",
};

export default function QuotationItemsEditor({
  quotation,
  onClose,
}: QuotationItemsEditorProps) {
  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false);

  const [
    editingItem,
    setEditingItem,
  ] = useState<QuotationItem | null>(
    null
  );

  const [form, setForm] =
    useState<ItemFormState>(
      emptyForm
    );

  const [errors, setErrors] =
    useState<ItemFormErrors>({});

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } =
    useQuotationItems(
      quotation?.id
    );

  const createItem =
    useCreateQuotationItem();

  const updateItem =
    useUpdateQuotationItem();

  const deleteItem =
    useDeleteQuotationItem();

  useEffect(() => {
    if (!isFormOpen) {
      setForm(
        emptyForm
      );

      setErrors({});

      setEditingItem(
        null
      );
    }
  }, [
    isFormOpen,
  ]);

  if (!quotation) {
    return null;
  }

  const items =
    data?.data ?? [];

  const isDraft =
    quotation.status ===
    "DRAFT";

  const subtotal =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.totalPrice
        ),
      0
    );

  const discount =
    Number(
      quotation.discount
    );

  const tax =
    Number(
      quotation.tax
    );

  const total =
    subtotal -
    discount +
    tax;

  const openCreateItem =
    () => {
      setEditingItem(
        null
      );

      setForm(
        emptyForm
      );

      setErrors({});

      setIsFormOpen(
        true
      );
    };

  const openEditItem =
    (
      item: QuotationItem
    ) => {
      setEditingItem(
        item
      );

      setForm({
        serviceName:
          item.serviceName,

        description:
          item.description ??
          "",

        quantity:
          String(
            item.quantity
          ),

        unitPrice:
          String(
            item.unitPrice
          ),
      });

      setErrors({});

      setIsFormOpen(
        true
      );
    };

  const closeItemForm =
    () => {
      if (
        createItem.isPending ||
        updateItem.isPending
      ) {
        return;
      }

      setIsFormOpen(
        false
      );
    };

  const updateField = (
    field: keyof ItemFormState,
    value: string
  ) => {
    setForm(
      (
        previous
      ) => ({
        ...previous,
        [field]:
          value,
      })
    );

    setErrors(
      (
        previous
      ) => ({
        ...previous,
        [field]:
          undefined,
      })
    );
  };

  const validate = () => {
    const nextErrors: ItemFormErrors =
      {};

    const serviceName =
      form.serviceName.trim();

    const quantity =
      Number(
        form.quantity
      );

    const unitPrice =
      Number(
        form.unitPrice
      );

    if (!serviceName) {
      nextErrors.serviceName =
        "Service name is required.";
    } else if (
      serviceName.length < 2
    ) {
      nextErrors.serviceName =
        "Service name must be at least 2 characters.";
    } else if (
      serviceName.length > 200
    ) {
      nextErrors.serviceName =
        "Service name cannot exceed 200 characters.";
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      nextErrors.quantity =
        "Quantity must be a positive whole number.";
    }

    if (
      !Number.isFinite(
        unitPrice
      ) ||
      unitPrice < 0
    ) {
      nextErrors.unitPrice =
        "Unit price must be a valid non-negative amount.";
    }

    setErrors(
      nextErrors
    );

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (editingItem) {
        await updateItem.mutateAsync(
          {
            itemId:
              editingItem.id,

            quotationId:
              quotation.id,

            data: {
              serviceName:
                form.serviceName.trim(),

              description:
                form.description.trim() ||
                undefined,

              quantity:
                Number(
                  form.quantity
                ),

              unitPrice:
                Number(
                  form.unitPrice
                ),
            },
          }
        );
      } else {
        await createItem.mutateAsync(
          {
            quotationId:
              quotation.id,

            data: {
              serviceName:
                form.serviceName.trim(),

              description:
                form.description.trim() ||
                undefined,

              quantity:
                Number(
                  form.quantity
                ),

              unitPrice:
                Number(
                  form.unitPrice
                ),
            },
          }
        );
      }

      setIsFormOpen(
        false
      );
    } catch {
      // Parent/page toast handling can be added later.
    }
  };

  const handleDelete =
    async (
      item: QuotationItem
    ) => {
      try {
        await deleteItem.mutateAsync(
          {
            itemId:
              item.id,

            quotationId:
              quotation.id,
          }
        );
      } catch {
        // Parent/page toast handling can be added later.
      }
    };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
      <div className="my-4 flex w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:my-8">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Quotation Items
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {quotation.quotationNumber} ·{" "}
              {quotation.client?.companyName ??
                "Client"}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              createItem.isPending ||
              updateItem.isPending ||
              deleteItem.isPending
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6">
          {/* Draft banner */}
          {!isDraft && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              This quotation is locked because it is no longer in draft status.
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading quotation items...
              </div>
            </div>
          ) : isError ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-red-700">
                Unable to load quotation items.
              </p>

              <button
                type="button"
                onClick={() =>
                  refetch()
                }
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Add item */}
              {isDraft && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={
                      openCreateItem
                    }
                    className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </button>
                </div>
              )}

              {/* Empty */}
              {items.length === 0 ? (
                <div className="mt-4 flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                    <Calculator className="h-6 w-6 text-slate-500" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    No quotation items yet
                  </h3>

                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Add services or products to calculate the quotation total.
                  </p>

                  {isDraft && (
                    <button
                      type="button"
                      onClick={
                        openCreateItem
                      }
                      className="mt-4 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Item
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  {/* Desktop */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Service
                          </th>

                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Qty
                          </th>

                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Unit Price
                          </th>

                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Total
                          </th>

                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {items.map(
                          (item) => (
                            <tr
                              key={
                                item.id
                              }
                            >
                              <td className="px-4 py-4">
                                <p className="text-sm font-medium text-slate-900">
                                  {
                                    item.serviceName
                                  }
                                </p>

                                {item.description && (
                                  <p className="mt-0.5 max-w-[320px] truncate text-xs text-slate-400">
                                    {
                                      item.description
                                    }
                                  </p>
                                )}
                              </td>

                              <td className="px-4 py-4 text-right text-sm text-slate-600">
                                {
                                  item.quantity
                                }
                              </td>

                              <td className="px-4 py-4 text-right text-sm text-slate-600">
                                {formatCurrency(
                                  item.unitPrice
                                )}
                              </td>

                              <td className="px-4 py-4 text-right text-sm font-medium text-slate-900">
                                {formatCurrency(
                                  item.totalPrice
                                )}
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex justify-end gap-1">
                                  {isDraft && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openEditItem(
                                            item
                                          )
                                        }
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                        title="Edit item"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDelete(
                                            item
                                          )
                                        }
                                        disabled={
                                          deleteItem.isPending
                                        }
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                                        title="Delete item"
                                      >
                                        {deleteItem.isPending ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="divide-y divide-slate-100 md:hidden">
                    {items.map(
                      (item) => (
                        <div
                          key={
                            item.id
                          }
                          className="p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">
                                {
                                  item.serviceName
                                }
                              </p>

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
                                    openEditItem(
                                      item
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                                  aria-label="Edit item"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      item
                                    )
                                  }
                                  disabled={
                                    deleteItem.isPending
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                                  aria-label="Delete item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-3">
                            <MiniValue
                              label="Qty"
                              value={String(
                                item.quantity
                              )}
                            />

                            <MiniValue
                              label="Unit"
                              value={formatCurrency(
                                item.unitPrice
                              )}
                            />

                            <MiniValue
                              label="Total"
                              value={formatCurrency(
                                item.totalPrice
                              )}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="mt-5 ml-auto w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="space-y-3">
                  <SummaryRow
                    label="Subtotal"
                    value={formatCurrency(
                      subtotal
                    )}
                  />

                  <SummaryRow
                    label="Discount"
                    value={`- ${formatCurrency(
                      discount
                    )}`}
                  />

                  <SummaryRow
                    label="Tax"
                    value={formatCurrency(
                      tax
                    )}
                  />

                  <div className="border-t border-slate-200 pt-3">
                    <SummaryRow
                      label="Total"
                      value={formatCurrency(
                        total
                      )}
                      strong
                    />
                  </div>
                </div>
              </div>
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
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Done
          </button>
        </div>
      </div>

      {/* Item Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[140] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
          <div className="my-4 w-full max-w-lg rounded-xl bg-white shadow-xl sm:my-8">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingItem
                    ? "Edit Quotation Item"
                    : "Add Quotation Item"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add a service or product to the quotation.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeItemForm
                }
                disabled={
                  createItem.isPending ||
                  updateItem.isPending
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="p-6"
            >
              <div className="space-y-5">
                {/* Service */}
                <div>
                  <label
                    htmlFor="quotationItemService"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Service / Product{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="quotationItemService"
                    type="text"
                    value={
                      form.serviceName
                    }
                    onChange={(event) =>
                      updateField(
                        "serviceName",
                        event.target.value
                      )
                    }
                    maxLength={200}
                    placeholder="e.g. Website Development"
                    disabled={
                      createItem.isPending ||
                      updateItem.isPending
                    }
                    className={inputClass(
                      errors.serviceName
                    )}
                  />

                  <FieldError
                    message={
                      errors.serviceName
                    }
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="quotationItemDescription"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Description
                    <span className="ml-1 font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    id="quotationItemDescription"
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    rows={3}
                    disabled={
                      createItem.isPending ||
                      updateItem.isPending
                    }
                    placeholder="Short description..."
                    className={`${inputClass()} resize-none`}
                  />
                </div>

                {/* Quantity */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="quotationItemQuantity"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Quantity{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="quotationItemQuantity"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        form.quantity
                      }
                      onChange={(event) =>
                        updateField(
                          "quantity",
                          event.target.value
                        )
                      }
                      disabled={
                        createItem.isPending ||
                        updateItem.isPending
                      }
                      className={inputClass(
                        errors.quantity
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
                      htmlFor="quotationItemUnitPrice"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Unit Price{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="quotationItemUnitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.unitPrice
                      }
                      onChange={(event) =>
                        updateField(
                          "unitPrice",
                          event.target.value
                        )
                      }
                      disabled={
                        createItem.isPending ||
                        updateItem.isPending
                      }
                      placeholder="0.00"
                      className={inputClass(
                        errors.unitPrice
                      )}
                    />

                    <FieldError
                      message={
                        errors.unitPrice
                      }
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Item Total
                    </span>

                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        Number(
                          form.quantity || 0
                        ) *
                          Number(
                            form.unitPrice || 0
                          )
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeItemForm
                  }
                  disabled={
                    createItem.isPending ||
                    updateItem.isPending
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    createItem.isPending ||
                    updateItem.isPending
                  }
                  className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {createItem.isPending ||
                  updateItem.isPending ? (
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
                        ? "Save Item"
                        : "Add Item"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small Components                                                           */
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

function MiniValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function inputClass(
  error?: string
) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
  } disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70`;
}

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

function formatCurrency(
  value: string | number
) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount
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
    }
  ).format(amount);
}