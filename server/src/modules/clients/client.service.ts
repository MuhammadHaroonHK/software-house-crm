import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";
import { ClientRepository } from "./client.repository";
import {
  CreateClientDTO,
  UpdateClientDTO,
} from "./client.types";

const clientRepository = new ClientRepository();

export class ClientService {
  async create(data: CreateClientDTO) {
    const existingClient = await clientRepository.findByEmail(
      data.email
    );

    if (existingClient) {
      throw new AppError(
        409,
        "Client email already exists."
      );
    }

    return clientRepository.create({
      companyName: data.companyName,
      industry: data.industry,
      website: data.website,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      notes: data.notes,
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const pagination = getPagination(query);

    const { clients, total } =
      await clientRepository.findAll(
        pagination.skip,
        pagination.limit,
        pagination.search,
        pagination.sortBy,
        pagination.sortOrder
      );

    return {
      data: clients,

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
    const client = await clientRepository.findById(id);

    if (!client) {
      throw new AppError(
        404,
        "Client not found."
      );
    }

    return client;
  }

  async update(
    id: string,
    data: UpdateClientDTO
  ) {
    const client =
      await clientRepository.findById(id);

    if (!client) {
      throw new AppError(
        404,
        "Client not found."
      );
    }

    if (data.email) {
      const emailExists =
        await clientRepository.findByEmailExceptId(
          data.email,
          id
        );

      if (emailExists) {
        throw new AppError(
          409,
          "Client email already exists."
        );
      }
    }

    return clientRepository.update(id, {
      ...(data.companyName && {
        companyName: data.companyName,
      }),

      ...(data.industry !== undefined && {
        industry: data.industry,
      }),

      ...(data.website !== undefined && {
        website: data.website,
      }),

      ...(data.email && {
        email: data.email,
      }),

      ...(data.phone !== undefined && {
        phone: data.phone,
      }),

      ...(data.address !== undefined && {
        address: data.address,
      }),

      ...(data.city !== undefined && {
        city: data.city,
      }),

      ...(data.country !== undefined && {
        country: data.country,
      }),

      ...(data.notes !== undefined && {
        notes: data.notes,
      }),
    });
  }

  async delete(id: string) {
    const client =
      await clientRepository.findById(id);

    if (!client) {
      throw new AppError(
        404,
        "Client not found."
      );
    }

    const projects =
      await clientRepository.countProjects(id);

    if (projects > 0) {
      throw new AppError(
        409,
        "Client cannot be deleted because projects are assigned to it."
      );
    }

    const quotations =
      await clientRepository.countQuotations(id);

    if (quotations > 0) {
      throw new AppError(
        409,
        "Client cannot be deleted because quotations are assigned to it."
      );
    }

    const contacts =
      await clientRepository.countContactPersons(
        id
      );

    if (contacts > 0) {
      throw new AppError(
        409,
        "Client cannot be deleted because contact persons are assigned to it."
      );
    }

    await clientRepository.delete(id);
  }
}

export const clientService =
  new ClientService();