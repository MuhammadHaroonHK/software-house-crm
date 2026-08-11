import { Prisma, QuotationStatus } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";
import {
  CreateQuotationDTO,
  UpdateQuotationDTO,
} from "./quotation.types";
import { QuotationRepository } from "./quotation.repository";

const quotationRepository = new QuotationRepository();

export class QuotationService {
  async create(data: CreateQuotationDTO) {
    // Validate client
    const client =
      await quotationRepository.findClientById(
        data.clientId
      );

    if (!client) {
      throw new AppError(
        404,
        "Client not found."
      );
    }

    // Prevent duplicate quotation numbers
    const existingQuotation =
      await quotationRepository.findByQuotationNumber(
        data.quotationNumber
      );

    if (existingQuotation) {
      throw new AppError(
        409,
        "Quotation number already exists."
      );
    }

    // Validate project
    if (data.projectId) {
      const project =
        await quotationRepository.findProjectById(
          data.projectId
        );

      if (!project) {
        throw new AppError(
          404,
          "Project not found."
        );
      }

      if (project.clientId !== data.clientId) {
        throw new AppError(
          400,
          "Selected project does not belong to this client."
        );
      }
    }

    const subtotal = data.subtotal;
    const discount = data.discount ?? 0;
    const tax = data.tax ?? 0;

    if (discount > subtotal) {
      throw new AppError(
        400,
        "Discount cannot be greater than subtotal."
      );
    }

    const totalAmount =
      subtotal - discount + tax;

    if (totalAmount < 0) {
      throw new AppError(
        400,
        "Quotation total amount cannot be negative."
      );
    }

    return quotationRepository.create({
      quotationNumber: data.quotationNumber,

      issueDate: new Date(data.issueDate),

      ...(data.expiryDate && {
        expiryDate: new Date(data.expiryDate),
      }),

      subtotal,

      discount,

      tax,

      totalAmount,

      ...(data.notes && {
        notes: data.notes,
      }),

      client: {
        connect: {
          id: data.clientId,
        },
      },

      ...(data.projectId && {
        project: {
          connect: {
            id: data.projectId,
          },
        },
      }),
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    clientId?: string;
    projectId?: string;
    status?: QuotationStatus;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const pagination = getPagination(query);

    const { quotations, total } =
      await quotationRepository.findAll(
        pagination.skip,
        pagination.limit,
        pagination.search,
        query.status,
        query.clientId,
        query.projectId,
        pagination.sortBy,
        pagination.sortOrder
      );

    return {
      data: quotations,

      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(
          total / pagination.limit
        ),
      },
    };
  }

  async findById(id: string) {
    const quotation =
      await quotationRepository.findById(id);

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    return quotation;
  }

  async update(
    id: string,
    data: UpdateQuotationDTO
  ) {
    const quotation =
      await quotationRepository.findById(id);

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    // Only draft quotations can be modified
    if (
      quotation.status !==
      QuotationStatus.DRAFT
    ) {
      throw new AppError(
        400,
        "Only draft quotations can be modified."
      );
    }

    // Check quotation number uniqueness
    if (
      data.quotationNumber &&
      data.quotationNumber !==
        quotation.quotationNumber
    ) {
      const exists =
        await quotationRepository.findByQuotationNumber(
          data.quotationNumber
        );

      if (exists) {
        throw new AppError(
          409,
          "Quotation number already exists."
        );
      }
    }

    const clientId =
      data.clientId ??
      quotation.clientId;

    // Validate new client
    if (data.clientId) {
      const client =
        await quotationRepository.findClientById(
          data.clientId
        );

      if (!client) {
        throw new AppError(
          404,
          "Client not found."
        );
      }
    }

    const projectId =
      data.projectId !== undefined
        ? data.projectId
        : quotation.projectId;

    // Validate project/client relationship
    if (projectId) {
      const project =
        await quotationRepository.findProjectById(
          projectId
        );

      if (!project) {
        throw new AppError(
          404,
          "Project not found."
        );
      }

      if (project.clientId !== clientId) {
        throw new AppError(
          400,
          "Selected project does not belong to this client."
        );
      }
    }

    // If client changes while keeping an existing
    // project, require the project to be changed/removed.
    if (
      data.clientId &&
      data.clientId !== quotation.clientId &&
      data.projectId === undefined &&
      quotation.projectId
    ) {
      throw new AppError(
        400,
        "Please update or remove the existing project when changing the client."
      );
    }

    const subtotal =
      data.subtotal ??
      Number(quotation.subtotal);

    const discount =
      data.discount ??
      Number(quotation.discount);

    const tax =
      data.tax ??
      Number(quotation.tax);

    if (discount > subtotal) {
      throw new AppError(
        400,
        "Discount cannot be greater than subtotal."
      );
    }

    const totalAmount =
      subtotal - discount + tax;

    if (totalAmount < 0) {
      throw new AppError(
        400,
        "Quotation total amount cannot be negative."
      );
    }

    // Validate effective dates
    const issueDate =
      data.issueDate
        ? new Date(data.issueDate)
        : quotation.issueDate;

    const expiryDate =
      data.expiryDate !== undefined
        ? data.expiryDate
          ? new Date(data.expiryDate)
          : null
        : quotation.expiryDate;

    if (
      expiryDate &&
      expiryDate < issueDate
    ) {
      throw new AppError(
        400,
        "Expiry date must be after issue date."
      );
    }

    const updateData: Prisma.QuotationUpdateInput =
      {
        ...(data.quotationNumber && {
          quotationNumber:
            data.quotationNumber,
        }),

        ...(data.issueDate && {
          issueDate: new Date(
            data.issueDate
          ),
        }),

        ...(data.expiryDate !== undefined && {
          expiryDate: data.expiryDate
            ? new Date(data.expiryDate)
            : null,
        }),

        subtotal,

        discount,

        tax,

        totalAmount,

        ...(data.notes !== undefined && {
          notes: data.notes,
        }),
      };

    if (data.clientId) {
      updateData.client = {
        connect: {
          id: data.clientId,
        },
      };
    }

    if (data.projectId !== undefined) {
      if (data.projectId === null) {
        updateData.project = {
          disconnect: true,
        };
      } else {
        updateData.project = {
          connect: {
            id: data.projectId,
          },
        };
      }
    }

    return quotationRepository.update(
      id,
      updateData
    );
  }

  async send(id: string) {
    const quotation =
      await quotationRepository.findById(id);

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    if (
      quotation.status !==
      QuotationStatus.DRAFT
    ) {
      throw new AppError(
        400,
        "Only draft quotations can be sent."
      );
    }

    // A quotation with a past expiry date
    // cannot be sent.
    if (
      quotation.expiryDate &&
      quotation.expiryDate < new Date()
    ) {
      throw new AppError(
        400,
        "This quotation has already expired."
      );
    }

    const items =
      await quotationRepository.findItemsByQuotationId(
        id
      );

    if (items.length === 0) {
      throw new AppError(
        400,
        "Quotation must contain at least one item before it can be sent."
      );
    }

    if (
      Number(quotation.totalAmount) <= 0
    ) {
      throw new AppError(
        400,
        "Quotation total amount must be greater than zero."
      );
    }

    return quotationRepository.update(id, {
      status: QuotationStatus.SENT,
    });
  }

  async accept(id: string) {
    const quotation =
      await quotationRepository.findById(id);

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    if (
      quotation.status !==
      QuotationStatus.SENT
    ) {
      throw new AppError(
        400,
        "Only sent quotations can be accepted."
      );
    }

    if (
      quotation.expiryDate &&
      quotation.expiryDate < new Date()
    ) {
      throw new AppError(
        400,
        "This quotation has expired."
      );
    }

    return quotationRepository.update(id, {
      status: QuotationStatus.ACCEPTED,
    });
  }

  async reject(id: string) {
    const quotation =
      await quotationRepository.findById(id);

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    if (
      quotation.status !==
      QuotationStatus.SENT
    ) {
      throw new AppError(
        400,
        "Only sent quotations can be rejected."
      );
    }

    // A quotation that has passed its expiry date
    // should not be rejected; it should be expired.
    if (
      quotation.expiryDate &&
      quotation.expiryDate < new Date()
    ) {
      throw new AppError(
        400,
        "This quotation has expired."
      );
    }

    return quotationRepository.update(id, {
      status: QuotationStatus.REJECTED,
    });
  }

  async expire(id: string) {
    const quotation =
      await quotationRepository.findById(id);

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    if (
      quotation.status !==
      QuotationStatus.SENT
    ) {
      throw new AppError(
        400,
        "Only sent quotations can expire."
      );
    }

    if (!quotation.expiryDate) {
      throw new AppError(
        400,
        "Quotation does not have an expiry date."
      );
    }

    if (
      quotation.expiryDate > new Date()
    ) {
      throw new AppError(
        400,
        "Quotation expiry date has not been reached."
      );
    }

    return quotationRepository.update(id, {
      status: QuotationStatus.EXPIRED,
    });
  }

  async delete(id: string) {
    const quotation =
      await quotationRepository.findById(id);

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    // Sent/accepted/rejected/expired quotations
    // must remain as historical records.
    if (
      quotation.status !==
      QuotationStatus.DRAFT
    ) {
      throw new AppError(
        400,
        "Only draft quotations can be deleted."
      );
    }

    await quotationRepository.delete(id);
  }
}