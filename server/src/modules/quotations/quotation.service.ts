import {
  Prisma,
  QuotationStatus,
  UserRole,
} from "@prisma/client";

import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";

import {
  CreateQuotationDTO,
  UpdateQuotationDTO,
} from "./quotation.types";

import { QuotationRepository } from "./quotation.repository";

const quotationRepository =
  new QuotationRepository();

export class QuotationService {
  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  private async generateQuotationNumber() {
    const prefix = "QT-";

    const latest =
      await quotationRepository.findLatestQuotationNumber(
        prefix
      );

    let nextNumber = 1000;

    if (latest) {
      const match =
        latest.match(/(\d+)$/);

      if (match) {
        nextNumber =
          Number(match[1]) + 1;
      }
    }

    return `${prefix}${nextNumber}`;
  }

  private async ensureClientOwnership(
    quotationClientId: string,
    actorId: string,
    actorRole: UserRole
  ) {
    if (
      actorRole !== UserRole.CLIENT
    ) {
      return;
    }

    const user =
      await quotationRepository.findUserById(
        actorId
      );

    if (!user) {
      throw new AppError(
        404,
        "User not found."
      );
    }

    if (
      !user.clientId ||
      user.clientId !==
        quotationClientId
    ) {
      throw new AppError(
        403,
        "You are not authorized to access this quotation."
      );
    }
  }

  private ensureInternalUser(
    actorRole: UserRole
  ) {
    if (
      actorRole !== UserRole.SUPER_ADMIN &&
      actorRole !== UserRole.PROJECT_MANAGER
    ) {
      throw new AppError(
        403,
        "You are not authorized to perform this quotation action."
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  async create(
    data: CreateQuotationDTO
  ) {
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

      if (
        project.clientId !==
        data.clientId
      ) {
        throw new AppError(
          400,
          "Selected project does not belong to this client."
        );
      }
    }

    const subtotal = 0;

    const discount =
      data.discount ?? 0;

    const tax =
      data.tax ?? 0;

    const totalAmount = 0;

    if (totalAmount < 0) {
      throw new AppError(
        400,
        "Quotation total amount cannot be negative."
      );
    }

    /*
     * Automatically generate quotation number.
     *
     * Example:
     * QT-1000
     * QT-1001
     * QT-1002
     */
    const quotationNumber =
      await this.generateQuotationNumber();

    return quotationRepository.create({
      quotationNumber,

      issueDate:
        new Date(
          data.issueDate
        ),

      ...(data.expiryDate && {
        expiryDate:
          new Date(
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

  /* ------------------------------------------------------------------------ */
  /* Find All                                                                 */
  /* ------------------------------------------------------------------------ */

  async findAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      clientId?: string;
      projectId?: string;
      status?: QuotationStatus;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
    actorId: string,
    actorRole: UserRole
  ) {
    const pagination =
      getPagination(query);

    let effectiveClientId =
      query.clientId;

    /*
     * CLIENT users can only see quotations
     * belonging to their linked client.
     */
    if (
      actorRole ===
      UserRole.CLIENT
    ) {
      const user =
        await quotationRepository.findUserById(
          actorId
        );

      if (!user) {
        throw new AppError(
          404,
          "User not found."
        );
      }

      if (!user.clientId) {
        throw new AppError(
          403,
          "Your account is not linked to a client."
        );
      }

      effectiveClientId =
        user.clientId;
    }

    const {
      quotations,
      total,
    } =
      await quotationRepository.findAll(
        pagination.skip,
        pagination.limit,
        pagination.search,
        query.status,
        effectiveClientId,
        query.projectId,
        pagination.sortBy,
        pagination.sortOrder
      );

    return {
      data: quotations,

      meta: {
        page:
          pagination.page,

        limit:
          pagination.limit,

        total,

        totalPages:
          Math.ceil(
            total /
              pagination.limit
          ),
      },
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Find By ID                                                               */
  /* ------------------------------------------------------------------------ */

  async findById(
    id: string,
    actorId: string,
    actorRole: UserRole
  ) {
    const quotation =
      await quotationRepository.findById(
        id
      );

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    await this.ensureClientOwnership(
      quotation.clientId,
      actorId,
      actorRole
    );

    return quotation;
  }

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  async update(
    id: string,
    data: UpdateQuotationDTO
  ) {
    const quotation =
      await quotationRepository.findById(
        id
      );

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
      data.projectId !==
      undefined
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

      if (
        project.clientId !==
        clientId
      ) {
        throw new AppError(
          400,
          "Selected project does not belong to this client."
        );
      }
    }

    /*
     * If client changes while retaining the
     * current project, force project change/removal.
     */
    if (
      data.clientId &&
      data.clientId !==
        quotation.clientId &&
      data.projectId ===
        undefined &&
      quotation.projectId
    ) {
      throw new AppError(
        400,
        "Please update or remove the existing project when changing the client."
      );
    }

    const subtotal =
      Number(
        quotation.subtotal
      );

    const discount =
      data.discount ??
      Number(
        quotation.discount
      );

    const tax =
      data.tax ??
      Number(
        quotation.tax
      );

    if (
      discount > subtotal
    ) {
      throw new AppError(
        400,
        "Discount cannot be greater than subtotal."
      );
    }

    const totalAmount =
      subtotal -
      discount +
      tax;

    // Validate effective dates
    const issueDate =
      data.issueDate
        ? new Date(
            data.issueDate
          )
        : quotation.issueDate;

    const expiryDate =
      data.expiryDate !==
      undefined
        ? data.expiryDate
          ? new Date(
              data.expiryDate
            )
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
        /*
         * quotationNumber is intentionally
         * NOT included.
         *
         * It is generated automatically and
         * remains immutable.
         */

        ...(data.issueDate && {
          issueDate:
            new Date(
              data.issueDate
            ),
        }),

        ...(data.expiryDate !==
          undefined && {
          expiryDate:
            data.expiryDate
              ? new Date(
                  data.expiryDate
                )
              : null,
        }),

        discount,

        tax,

        totalAmount,

        ...(data.notes !==
          undefined && {
          notes:
            data.notes,
        }),
      };

    if (data.clientId) {
      updateData.client = {
        connect: {
          id: data.clientId,
        },
      };
    }

    if (
      data.projectId !==
      undefined
    ) {
      if (
        data.projectId ===
        null
      ) {
        updateData.project = {
          disconnect: true,
        };
      } else {
        updateData.project = {
          connect: {
            id:
              data.projectId,
          },
        };
      }
    }

    return quotationRepository.update(
      id,
      updateData
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Send                                                                     */
  /* ------------------------------------------------------------------------ */

  async send(
    id: string
  ) {
    const quotation =
      await quotationRepository.findById(
        id
      );

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

    if (
      quotation.expiryDate &&
      quotation.expiryDate <
        new Date()
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
      Number(
        quotation.totalAmount
      ) <= 0
    ) {
      throw new AppError(
        400,
        "Quotation total amount must be greater than zero."
      );
    }

    return quotationRepository.update(
      id,
      {
        status:
          QuotationStatus.SENT,
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Accept                                                                   */
  /* ------------------------------------------------------------------------ */

  async accept(
    id: string,
    actorId: string,
    actorRole: UserRole
  ) {
    if (
      actorRole !==
      UserRole.CLIENT
    ) {
      throw new AppError(
        403,
        "Only the client can accept a quotation."
      );
    }

    const quotation =
      await quotationRepository.findById(
        id
      );

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    await this.ensureClientOwnership(
      quotation.clientId,
      actorId,
      actorRole
    );

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
      quotation.expiryDate <
        new Date()
    ) {
      throw new AppError(
        400,
        "This quotation has expired."
      );
    }

    return quotationRepository.update(
      id,
      {
        status:
          QuotationStatus.ACCEPTED,
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Reject                                                                   */
  /* ------------------------------------------------------------------------ */

  async reject(
    id: string,
    actorId: string,
    actorRole: UserRole
  ) {
    if (
      actorRole !==
      UserRole.CLIENT
    ) {
      throw new AppError(
        403,
        "Only the client can reject a quotation."
      );
    }

    const quotation =
      await quotationRepository.findById(
        id
      );

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    await this.ensureClientOwnership(
      quotation.clientId,
      actorId,
      actorRole
    );

    if (
      quotation.status !==
      QuotationStatus.SENT
    ) {
      throw new AppError(
        400,
        "Only sent quotations can be rejected."
      );
    }

    if (
      quotation.expiryDate &&
      quotation.expiryDate <
        new Date()
    ) {
      throw new AppError(
        400,
        "This quotation has expired."
      );
    }

    return quotationRepository.update(
      id,
      {
        status:
          QuotationStatus.REJECTED,
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Expire                                                                   */
  /* ------------------------------------------------------------------------ */

  async expire(
    id: string
  ) {
    const quotation =
      await quotationRepository.findById(
        id
      );

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
      quotation.expiryDate >
      new Date()
    ) {
      throw new AppError(
        400,
        "Quotation expiry date has not been reached."
      );
    }

    return quotationRepository.update(
      id,
      {
        status:
          QuotationStatus.EXPIRED,
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  async delete(
    id: string
  ) {
    const quotation =
      await quotationRepository.findById(
        id
      );

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    // Historical quotations must remain preserved.
    if (
      quotation.status !==
      QuotationStatus.DRAFT
    ) {
      throw new AppError(
        400,
        "Only draft quotations can be deleted."
      );
    }

    await quotationRepository.delete(
      id
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Internal permission helper                                               */
  /* ------------------------------------------------------------------------ */

  ensureInternalQuotationUser(
    actorRole: UserRole
  ) {
    this.ensureInternalUser(
      actorRole
    );
  }
}

export const quotationService =
  new QuotationService();