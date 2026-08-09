import { QuotationStatus } from "@prisma/client";
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
    // Client validation
    const client =
      await quotationRepository.findClientById(
        data.clientId
      );

    if (!client) {
      throw new AppError(404, "Client not found.");
    }

    // Duplicate quotation number
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

    // Project validation
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

    const totalAmount =
      subtotal - discount + tax;

    return quotationRepository.create({
      quotationNumber: data.quotationNumber,

      issueDate: new Date(data.issueDate),

      ...(data.expiryDate && {
        expiryDate: new Date(
          data.expiryDate
        ),
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
    const pagination =
      getPagination(query);

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

    if (
  quotation.status !== QuotationStatus.DRAFT
) {
  throw new AppError(
    400,
    "Only draft quotations can be modified."
  );
}

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

    if (data.clientId) {
      const client =
        await quotationRepository.findClientById(
          clientId
        );

      if (!client) {
        throw new AppError(
          404,
          "Client not found."
        );
      }
    }

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

      if (project.clientId !== clientId) {
        throw new AppError(
          400,
          "Selected project does not belong to this client."
        );
      }
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

    const totalAmount =
      subtotal - discount + tax;
          const updateData: any = {
      ...(data.quotationNumber && {
        quotationNumber: data.quotationNumber,
      }),

      ...(data.issueDate && {
        issueDate: new Date(data.issueDate),
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
    quotation.status !== QuotationStatus.DRAFT
  ) {
    throw new AppError(
      400,
      "Only draft quotations can be sent."
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

  if (Number(quotation.totalAmount) <= 0) {
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
    quotation.status !== QuotationStatus.SENT
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
    quotation.status !== QuotationStatus.SENT
  ) {
    throw new AppError(
      400,
      "Only sent quotations can be rejected."
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
    quotation.status !== QuotationStatus.SENT
  ) {
    throw new AppError(
      400,
      "Only sent quotations can expire."
    );
  }

  if (
    !quotation.expiryDate ||
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

    await quotationRepository.delete(id);
  }
}