import prisma from "../../lib/prisma";

export class ContactPersonRepository {
  async create(data: {
    clientId: string;
    firstName: string;
    lastName: string;
    designation?: string;
    email?: string;
    phone?: string;
  }) {
    return prisma.contactPerson.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.contactPerson.findUnique({
      where: {
        id,
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

    const [contactPersons, total] = await Promise.all([
      prisma.contactPerson.findMany({
        where,
        skip,
        take: limit,

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
    }
  ) {
    return prisma.contactPerson.update({
      where: {
        id,
      },

      data,
    });
  }

  async delete(id: string) {
    return prisma.contactPerson.delete({
      where: {
        id,
      },
    });
  }
}