import prisma from "../../lib/prisma";

export class ContactPersonRepository {
  async create(data: {
    clientId: string;
    firstName: string;
    lastName: string;
    designation?: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
  }) {
    return prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.contactPerson.updateMany({
          where: {
            clientId: data.clientId,
            isPrimary: true,
          },
          data: {
            isPrimary: false,
          },
        });
      }

      return tx.contactPerson.create({
        data,
        include: {
          client: true,
        },
      });
    });
  }

  async findById(id: string) {
    return prisma.contactPerson.findUnique({
      where: {
        id,
      },
      include: {
        client: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.contactPerson.findFirst({
      where: {
        email,
      },
    });
  }

  async findByEmailExceptId(
    email: string,
    id: string
  ) {
    return prisma.contactPerson.findFirst({
      where: {
        email,
        NOT: {
          id,
        },
      },
    });
  }

  async findPrimaryByClientId(clientId: string) {
    return prisma.contactPerson.findFirst({
      where: {
        clientId,
        isPrimary: true,
      },
    });
  }

  async findAll(
    skip: number,
    limit: number,
    search: string,
    clientId: string | undefined,
    sortBy: string,
    sortOrder: "asc" | "desc"
  ) {
    const where = {
      ...(clientId && {
        clientId,
      }),

      ...(search && {
        OR: [
          {
            firstName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            lastName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            designation: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const [contactPersons, total] =
      await Promise.all([
        prisma.contactPerson.findMany({
          where,
          skip,
          take: limit,

          include: {
            client: true,
          },

          orderBy: {
            [sortBy]: sortOrder,
          },
        }),

        prisma.contactPerson.count({
          where,
        }),
      ]);

    return {
      contactPersons,
      total,
    };
  }

  async update(
    id: string,
    data: {
      clientId?: string;
      firstName?: string;
      lastName?: string;
      designation?: string;
      email?: string;
      phone?: string;
      isPrimary?: boolean;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const current =
        await tx.contactPerson.findUnique({
          where: {
            id,
          },
        });

      if (!current) {
        return null;
      }

      const targetClientId =
        data.clientId ?? current.clientId;

      if (data.isPrimary === true) {
        await tx.contactPerson.updateMany({
          where: {
            clientId: targetClientId,
            isPrimary: true,
            NOT: {
              id,
            },
          },
          data: {
            isPrimary: false,
          },
        });
      }

      return tx.contactPerson.update({
        where: {
          id,
        },

        data,

        include: {
          client: true,
        },
      });
    });
  }

  async delete(id: string) {
    return prisma.contactPerson.delete({
      where: {
        id,
      },
    });
  }

  async setPrimary(id: string, clientId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.contactPerson.updateMany({
      where: {
        clientId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });

    return tx.contactPerson.update({
      where: {
        id,
      },
      data: {
        isPrimary: true,
      },
    });
  });
}
}

export const contactPersonRepository =
  new ContactPersonRepository();