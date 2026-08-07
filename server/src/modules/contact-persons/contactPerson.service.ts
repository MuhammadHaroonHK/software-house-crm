import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";
import { ClientRepository } from "../clients/client.repository";
import { ContactPersonRepository } from "./contactPerson.repository";

const contactPersonRepository = new ContactPersonRepository();
const clientRepository = new ClientRepository();

export class ContactPersonService {
  async create(data: {
    clientId: string;
    firstName: string;
    lastName: string;
    designation?: string;
    email?: string;
    phone?: string;
  }) {
    const client = await clientRepository.findById(data.clientId);

    if (!client) {
      throw new AppError(404, "Client not found.");
    }

    if (data.email) {
      const existing = await contactPersonRepository.findByEmail(
        data.email
      );

      if (existing) {
        throw new AppError(
          409,
          "Contact person email already exists."
        );
      }
    }

    return contactPersonRepository.create(data);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    clientId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const pagination = getPagination(query);

    const { contactPersons, total } =
      await contactPersonRepository.findAll(
        pagination.skip,
        pagination.limit,
        pagination.search,
        query.clientId,
        pagination.sortBy,
        pagination.sortOrder
      );

    return {
      data: contactPersons,
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
    const contact =
      await contactPersonRepository.findById(id);

    if (!contact) {
      throw new AppError(
        404,
        "Contact person not found."
      );
    }

    return contact;
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
    const contact =
      await contactPersonRepository.findById(id);

    if (!contact) {
      throw new AppError(
        404,
        "Contact person not found."
      );
    }

    if (data.clientId) {
      const client = await clientRepository.findById(
        data.clientId
      );

      if (!client) {
        throw new AppError(
          404,
          "Client not found."
        );
      }
    }

    if (data.email) {
      const existing =
        await contactPersonRepository.findByEmailExceptId(
          data.email,
          id
        );

      if (existing) {
        throw new AppError(
          409,
          "Contact person email already exists."
        );
      }
    }

    return contactPersonRepository.update(id, data);
  }

  async delete(id: string) {
    const contact =
      await contactPersonRepository.findById(id);

    if (!contact) {
      throw new AppError(
        404,
        "Contact person not found."
      );
    }

    await contactPersonRepository.delete(id);
  }
}

export const contactPersonService =
  new ContactPersonService();