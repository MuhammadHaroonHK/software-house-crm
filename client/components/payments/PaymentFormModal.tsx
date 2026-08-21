"use client";

import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileImage,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "EASYPAISA"
  | "JAZZCASH";

export interface PaymentInvoiceOption {
  id: string;
  invoiceNumber: string;

  totalAmount: string | number;
  amountPaid: string | number;
  balanceDue: string | number;

  status:
    | "DRAFT"
    | "SENT"
    | "PARTIALLY_PAID"
    | "PAID"
    | "OVERDUE";

  quotation?: {
    client?: {
      id: string;
      companyName: string;
    };
  };
}

export interface PaymentReceiverDetails {
  bankName?: string | null;
  accountTitle?: string | null;
  accountNumber?: string | null;
  iban?: string | null;
  easyPaisaNumber?: string | null;
  jazzCashNumber?: string | null;
  currency?: string | null;
}

export interface PaymentFormSubmitData {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  accountTitle?: string;
  accountNumber?: string;
  referenceNumber?: string;
  notes?: string;
  receiptImage?: File | null;
}

interface PaymentFormModalProps {
  open: boolean;

  invoices: PaymentInvoiceOption[];

  initialInvoice?: PaymentInvoiceOption | null;

  receiverDetails?: PaymentReceiverDetails | null;

  isLoadingInvoices?: boolean;
  isLoadingReceiverDetails?: boolean;
  isSubmitting?: boolean;

  error?: string | null;

  onClose: () => void;

  onCreate: (
    data: PaymentFormSubmitData,
  ) => void | Promise<void>;
}

interface FormState {
  invoiceId: string;
  amount: string;
  paymentMethod: PaymentMethod | "";
  paymentDate: string;
  accountTitle: string;
  accountNumber: string;
  referenceNumber: string;
  notes: string;
}

interface FormErrors {
  invoiceId?: string;
  amount?: string;
  paymentMethod?: string;
  paymentDate?: string;
  accountTitle?: string;
  accountNumber?: string;
  referenceNumber?: string;
  notes?: string;
  receiptImage?: string;
}

const emptyForm: FormState = {
  invoiceId: "",
  amount: "",
  paymentMethod: "",
  paymentDate: "",
  accountTitle: "",
  accountNumber: "",
  referenceNumber: "",
  notes: "",
};

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
}[] = [
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
  },
  {
    value: "EASYPAISA",
    label: "EasyPaisa",
  },
  {
    value: "JAZZCASH",
    label: "JazzCash",
  },
  {
    value: "CASH",
    label: "Cash",
  },
];

export default function PaymentFormModal({
  open,
  invoices,
  initialInvoice,
  receiverDetails,
  isLoadingInvoices = false,
  isLoadingReceiverDetails = false,
  isSubmitting = false,
  error,
  onClose,
  onCreate,
}: PaymentFormModalProps) {
  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [receiptImage, setReceiptImage] =
    useState<File | null>(null);

  const [receiptPreview, setReceiptPreview] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Initialize                                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      ...emptyForm,

      invoiceId:
        initialInvoice?.id ?? "",

      paymentDate:
        getTodayInputValue(),
    });

    setErrors({});

    setReceiptImage(null);
    setReceiptPreview(null);
  }, [open, initialInvoice]);

  /* ------------------------------------------------------------------------ */
  /* Eligible invoices                                                        */
  /* ------------------------------------------------------------------------ */

  const eligibleInvoices =
    useMemo(
      () =>
        invoices.filter(
          (invoice) =>
            invoice.status !== "DRAFT" &&
            invoice.status !== "PAID" &&
            Number(invoice.balanceDue) > 0,
        ),
      [invoices],
    );

  /* ------------------------------------------------------------------------ */
  /* Selected invoice                                                         */
  /* ------------------------------------------------------------------------ */

  const selectedInvoice =
    useMemo(
      () =>
        eligibleInvoices.find(
          (invoice) =>
            invoice.id ===
            form.invoiceId,
        ) ?? null,
      [
        eligibleInvoices,
        form.invoiceId,
      ],
    );

  const remainingBalance =
    selectedInvoice
      ? Number(
          selectedInvoice.balanceDue,
        )
      : 0;

  /* ------------------------------------------------------------------------ */
  /* Cleanup preview                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    return () => {
      if (receiptPreview) {
        URL.revokeObjectURL(
          receiptPreview,
        );
      }
    };
  }, [receiptPreview]);

  /* ------------------------------------------------------------------------ */
  /* Closed                                                                   */
  /* ------------------------------------------------------------------------ */

  if (!open) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* Update field                                                             */
  /* ------------------------------------------------------------------------ */

  const updateField = (
    field: keyof FormState,
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
        [field]:
          undefined,
      }),
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Invoice change                                                           */
  /* ------------------------------------------------------------------------ */

  const handleInvoiceChange = (
    invoiceId: string,
  ) => {
    updateField(
      "invoiceId",
      invoiceId,
    );

    const invoice =
      eligibleInvoices.find(
        (item) =>
          item.id === invoiceId,
      );

    if (invoice) {
      setForm(
        (previous) => ({
          ...previous,
          invoiceId,
          amount:
            Number(
              invoice.balanceDue,
            ) > 0
              ? ""
              : previous.amount,
        }),
      );
    }
    setErrors(
      (previous) => ({
        ...previous,
        invoiceId:
          undefined,
        amount:
          undefined,
      }),
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Receipt                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleReceiptChange = (
    file: File | null,
  ) => {
    setErrors(
      (previous) => ({
        ...previous,
        receiptImage:
          undefined,
      }),
    );

    if (!file) {
      setReceiptImage(null);
      setReceiptPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors(
        (previous) => ({
          ...previous,
          receiptImage:
            "Please upload an image file.",
        }),
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(
        (previous) => ({
          ...previous,
          receiptImage:
            "Receipt image cannot exceed 5 MB.",
        }),
      );
      return;
    }

    if (receiptPreview) {
      URL.revokeObjectURL(
        receiptPreview,
      );
    }

    setReceiptImage(file);

    setReceiptPreview(
      URL.createObjectURL(file),
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Validation                                                               */
  /* ------------------------------------------------------------------------ */

  const validate = () => {
    const nextErrors: FormErrors = {};

    const amount =
      Number(form.amount);

    if (!form.invoiceId) {
      nextErrors.invoiceId =
        "Please select an invoice.";
    }

    if (!selectedInvoice) {
      nextErrors.invoiceId =
        "Please select a valid invoice with an outstanding balance.";
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      nextErrors.amount =
        "Payment amount must be greater than zero.";
    } else if (
      amount > remainingBalance
    ) {
      nextErrors.amount =
        "Payment amount cannot exceed the remaining balance.";
    }

    if (!form.paymentMethod) {
      nextErrors.paymentMethod =
        "Please select a payment method.";
    }

    if (!form.paymentDate) {
      nextErrors.paymentDate =
        "Payment date is required.";
    } else {
      const paymentDate =
        new Date(
          form.paymentDate,
        );

      if (
        Number.isNaN(
          paymentDate.getTime(),
        )
      ) {
        nextErrors.paymentDate =
          "Please enter a valid payment date.";
      }
    }

    if (
      form.accountTitle.trim()
        .length > 200
    ) {
      nextErrors.accountTitle =
        "Account title cannot exceed 200 characters.";
    }

    if (
      form.accountNumber.trim()
        .length > 100
    ) {
      nextErrors.accountNumber =
        "Account number cannot exceed 100 characters.";
    }

    if (
      form.referenceNumber.trim()
        .length > 100
    ) {
      nextErrors.referenceNumber =
        "Reference number cannot exceed 100 characters.";
    }

    if (
      form.notes.trim().length >
      5000
    ) {
      nextErrors.notes =
        "Notes cannot exceed 5000 characters.";
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

  /* ------------------------------------------------------------------------ */
  /* Submit                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onCreate({
      invoiceId:
        form.invoiceId,

      amount:
        Number(form.amount),

      paymentMethod:
        form.paymentMethod as PaymentMethod,

      paymentDate:
        form.paymentDate ||
        undefined,

      accountTitle:
        form.accountTitle.trim() ||
        undefined,

      accountNumber:
        form.accountNumber.trim() ||
        undefined,

      referenceNumber:
        form.referenceNumber.trim() ||
        undefined,

      notes:
        form.notes.trim() ||
        undefined,

      receiptImage,
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Receiver details                                                         */
  /* ------------------------------------------------------------------------ */

  const showBankDetails =
    form.paymentMethod ===
    "BANK_TRANSFER";

  const showEasyPaisaDetails =
    form.paymentMethod ===
    "EASYPAISA";

  const showJazzCashDetails =
    form.paymentMethod ===
    "JAZZCASH";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
      <div className="my-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:my-8">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Record Payment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Submit a payment for an outstanding invoice.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close payment form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Form                                                              */}
        {/* ---------------------------------------------------------------- */}

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6"
        >
          {/* Invoice */}

          <div>
            <label
              htmlFor="paymentInvoice"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Invoice
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            {isLoadingInvoices ? (
              <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading eligible invoices...
              </div>
            ) : (
              <select
                id="paymentInvoice"
                value={
                  form.invoiceId
                }
                onChange={(event) =>
                  handleInvoiceChange(
                    event.target.value,
                  )
                }
                disabled={
                  isSubmitting ||
                  eligibleInvoices.length ===
                    0
                }
                className={inputClass(
                  errors.invoiceId,
                )}
              >
                <option value="">
                  Select invoice
                </option>

                {eligibleInvoices.map(
                  (invoice) => (
                    <option
                      key={
                        invoice.id
                      }
                      value={
                        invoice.id
                      }
                    >
                      {
                        invoice.invoiceNumber
                      }{" "}
                      —{" "}
                      {invoice.quotation?.client
                        ?.companyName ??
                        "Client"}{" "}
                      — Balance{" "}
                      {formatCurrency(
                        invoice.balanceDue,
                      )}
                    </option>
                  ),
                )}
              </select>
            )}

            <FieldError
              message={
                errors.invoiceId
              }
            />

            {!isLoadingInvoices &&
              eligibleInvoices.length ===
                0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No invoices with an outstanding balance are currently available.
                </p>
              )}
          </div>

          {/* Invoice summary */}

          {selectedInvoice && (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryCard
                label="Invoice"
                value={
                  selectedInvoice.invoiceNumber
                }
              />

              <SummaryCard
                label="Total"
                value={formatCurrency(
                  selectedInvoice.totalAmount,
                )}
              />

              <SummaryCard
                label="Balance Due"
                value={formatCurrency(
                  selectedInvoice.balanceDue,
                )}
                highlight
              />
            </div>
          )}

          {/* Receiver details */}

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                <CreditCard className="h-4 w-4 text-slate-500" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Payment Receiver Details
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Use the company payment details below when making a payment.
                </p>

                {isLoadingReceiverDetails ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading payment details...
                  </div>
                ) : receiverDetails ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {receiverDetails.bankName && (
                      <SummaryField
                        label="Bank"
                        value={
                          receiverDetails.bankName
                        }
                      />
                    )}

                    {receiverDetails.accountTitle && (
                      <SummaryField
                        label="Account Title"
                        value={
                          receiverDetails.accountTitle
                        }
                      />
                    )}

                    {receiverDetails.accountNumber && (
                      <SummaryField
                        label="Account Number"
                        value={
                          receiverDetails.accountNumber
                        }
                      />
                    )}

                    {receiverDetails.iban && (
                      <SummaryField
                        label="IBAN"
                        value={
                          receiverDetails.iban
                        }
                      />
                    )}

                    {receiverDetails.easyPaisaNumber && (
                      <SummaryField
                        label="EasyPaisa"
                        value={
                          receiverDetails.easyPaisaNumber
                        }
                      />
                    )}

                    {receiverDetails.jazzCashNumber && (
                      <SummaryField
                        label="JazzCash"
                        value={
                          receiverDetails.jazzCashNumber
                        }
                      />
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-amber-600">
                    Company payment details are not configured.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main payment fields */}

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Amount */}

            <div>
              <label
                htmlFor="paymentAmount"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Payment Amount
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <Banknote className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="paymentAmount"
                  type="number"
                  min="0.01"
                  max={
                    remainingBalance ||
                    undefined
                  }
                  step="0.01"
                  value={
                    form.amount
                  }
                  onChange={(event) =>
                    updateField(
                      "amount",
                      event.target.value,
                    )
                  }
                  disabled={
                    isSubmitting ||
                    !selectedInvoice
                  }
                  placeholder="0.00"
                  className={`pl-9 ${inputClass(
                    errors.amount,
                  )}`}
                />
              </div>

              <div className="mt-1 flex items-center justify-between gap-3">
                <FieldError
                  message={
                    errors.amount
                  }
                />

                {selectedInvoice && (
                  <p className="text-xs text-slate-400">
                    Max:{" "}
                    {formatCurrency(
                      remainingBalance,
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Method */}

            <div>
              <label
                htmlFor="paymentMethod"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Payment Method
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="paymentMethod"
                value={
                  form.paymentMethod
                }
                onChange={(event) =>
                  updateField(
                    "paymentMethod",
                    event.target.value,
                  )
                }
                disabled={
                  isSubmitting
                }
                className={inputClass(
                  errors.paymentMethod,
                )}
              >
                <option value="">
                  Select payment method
                </option>

                {PAYMENT_METHODS.map(
                  (method) => (
                    <option
                      key={
                        method.value
                      }
                      value={
                        method.value
                      }
                    >
                      {method.label}
                    </option>
                  ),
                )}
              </select>

              <FieldError
                message={
                  errors.paymentMethod
                }
              />
            </div>

            {/* Payment date */}

            <div>
              <label
                htmlFor="paymentDate"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Payment Date
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="paymentDate"
                  type="date"
                  value={
                    form.paymentDate
                  }
                  onChange={(event) =>
                    updateField(
                      "paymentDate",
                      event.target.value,
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                  className={`pl-9 ${inputClass(
                    errors.paymentDate,
                  )}`}
                />
              </div>

              <FieldError
                message={
                  errors.paymentDate
                }
              />
            </div>

            {/* Reference */}

            <div>
              <label
                htmlFor="paymentReference"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Reference Number
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="paymentReference"
                type="text"
                value={
                  form.referenceNumber
                }
                onChange={(event) =>
                  updateField(
                    "referenceNumber",
                    event.target.value,
                  )
                }
                maxLength={100}
                disabled={
                  isSubmitting
                }
                placeholder="Transaction/reference number"
                className={inputClass(
                  errors.referenceNumber,
                )}
              />

              <FieldError
                message={
                  errors.referenceNumber
                }
              />
            </div>

            {/* Account title */}

            <div>
              <label
                htmlFor="paymentAccountTitle"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Sender Account Title
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="paymentAccountTitle"
                type="text"
                value={
                  form.accountTitle
                }
                onChange={(event) =>
                  updateField(
                    "accountTitle",
                    event.target.value,
                  )
                }
                maxLength={200}
                disabled={
                  isSubmitting
                }
                placeholder="Account holder name"
                className={inputClass(
                  errors.accountTitle,
                )}
              />

              <FieldError
                message={
                  errors.accountTitle
                }
              />
            </div>

            {/* Account number */}

            <div>
              <label
                htmlFor="paymentAccountNumber"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Sender Account Number
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="paymentAccountNumber"
                type="text"
                value={
                  form.accountNumber
                }
                onChange={(event) =>
                  updateField(
                    "accountNumber",
                    event.target.value,
                  )
                }
                maxLength={100}
                disabled={
                  isSubmitting
                }
                placeholder="Account / wallet number"
                className={inputClass(
                  errors.accountNumber,
                )}
              />

              <FieldError
                message={
                  errors.accountNumber
                }
              />
            </div>

            {/* Payment-specific helper */}

            {showBankDetails && (
              <div className="sm:col-span-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-xs leading-5 text-blue-700">
                  For bank transfers, include the transaction/reference number and sender account details so the payment can be verified quickly.
                </p>
              </div>
            )}

            {showEasyPaisaDetails && (
              <div className="sm:col-span-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-xs leading-5 text-blue-700">
                  Use the configured EasyPaisa number shown above and provide the transaction/reference number when available.
                </p>
              </div>
            )}

            {showJazzCashDetails && (
              <div className="sm:col-span-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-xs leading-5 text-blue-700">
                  Use the configured JazzCash number shown above and provide the transaction/reference number when available.
                </p>
              </div>
            )}

            {/* Receipt */}

            <div className="sm:col-span-2">
              <label
                htmlFor="paymentReceipt"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Payment Receipt
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <label
                htmlFor="paymentReceipt"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-slate-400 hover:bg-slate-100"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                  {receiptImage ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-slate-500" />
                  )}
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                  {receiptImage
                    ? receiptImage.name
                    : "Upload payment receipt"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  PNG, JPG, JPEG — maximum 5 MB
                </p>

                <input
                  id="paymentReceipt"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(event) =>
                    handleReceiptChange(
                      event.target
                        .files?.[0] ??
                        null,
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                  className="sr-only"
                />
              </label>

              <FieldError
                message={
                  errors.receiptImage
                }
              />

              {receiptPreview && (
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                  <img
                    src={
                      receiptPreview
                    }
                    alt="Payment receipt preview"
                    className="max-h-64 w-full object-contain bg-slate-50"
                  />
                </div>
              )}
            </div>

            {/* Notes */}

            <div className="sm:col-span-2">
              <label
                htmlFor="paymentNotes"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Notes
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="paymentNotes"
                value={
                  form.notes
                }
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value,
                  )
                }
                rows={4}
                maxLength={5000}
                disabled={
                  isSubmitting
                }
                placeholder="Additional payment information..."
                className={`${inputClass(
                  errors.notes,
                )} resize-none`}
              />

              <div className="mt-1 flex justify-between gap-4">
                <FieldError
                  message={
                    errors.notes
                  }
                />

                <p className="text-xs text-slate-400">
                  {
                    form.notes.length
                  }
                  /5000
                </p>
              </div>
            </div>
          </div>

          {/* Important workflow note */}

          <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-xs leading-5 text-amber-700">
              Your payment will initially be recorded as{" "}
              <span className="font-semibold">
                Pending
              </span>
              . An administrator or project manager must verify the payment before it affects the invoice balance.
            </p>
          </div>

          {/* Backend error */}

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={
                isSubmitting
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                eligibleInvoices.length ===
                  0
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4" />
                  Submit Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary card                                                               */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-sm font-semibold ${
          highlight
            ? "text-emerald-700"
            : "text-slate-800"
        }`}
      >
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
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Input                                                                      */
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
/* Error                                                                      */
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
/* Date                                                                       */
/* -------------------------------------------------------------------------- */

function getTodayInputValue() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Currency                                                                   */
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