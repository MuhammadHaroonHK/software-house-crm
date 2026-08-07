import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export class ClientRepository {
  async create(data: Prisma.ClientCreateInput) {
    return prisma.client.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return prisma.client.findUnique({
      where: {
        email,
      },
    });
  }

  async findByEmailExceptId(
    email: string,
    id: string
  ) {
    return prisma.client.findFirst({
      where: {
        email,
        NOT: {
          id,
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.client.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(
    skip: number,
    limit: number,
    search: string,
    sortBy: string,
    sortOrder: "asc" | "desc"
  ) {
    const where: Prisma.ClientWhereInput = search
      ? {
          OR: [
            {
              companyName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              phone: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              city: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              country: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),

      prisma.client.count({
        where,
      }),
    ]);

    return {
      clients,
      total,
    };
  }

  async update(
    id: string,
    data: Prisma.ClientUpdateInput
  ) {
    return prisma.client.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return prisma.client.delete({
      where: {
        id,
      },
    });
  }

  async countProjects(id: string) {
    return prisma.project.count({
      where: {
        clientId: id,
      },
    });
  }

  async countQuotations(id: string) {
    return prisma.quotation.count({
      where: {
        clientId: id,
      },
    });
  }

  async countContactPersons(id: string) {
    return prisma.contactPerson.count({
      where: {
        clientId: id,
      },
    });
  }
}