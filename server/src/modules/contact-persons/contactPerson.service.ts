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
    isPrimary?: boolean;
  }) {
    const client = await clientRepository.findById(data.clientId);

    if (!client) {
      throw new AppError(404, "Client not found.");
    }

    if (data.email) {
      const existing = await contactPersonRepository.findByEmail(data.email);

      if (existing) {
        throw new AppError(409, "Contact person email already exists.");
      }
    }

    const existingPrimary = await contactPersonRepository.findPrimaryByClientId(
      data.clientId,
    );

    /*
     * First contact of a client automatically
     * becomes the primary contact.
     */
    const isPrimary = existingPrimary === null ? true : data.isPrimary === true;

    return contactPersonRepository.create({
      ...data,
      isPrimary,
    });
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

    const { contactPersons, total } = await contactPersonRepository.findAll(
      pagination.skip,
      pagination.limit,
      pagination.search,
      query.clientId,
      pagination.sortBy,
      pagination.sortOrder,
    );

    return {
      data: contactPersons,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findById(id: string) {
    const contact = await contactPersonRepository.findById(id);

    if (!contact) {
      throw new AppError(404, "Contact person not found.");
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
      isPrimary?: boolean;
    },
  ) {
    const contact = await contactPersonRepository.findById(id);

    if (!contact) {
      throw new AppError(404, "Contact person not found.");
    }

    const targetClientId = data.clientId ?? contact.clientId;

    /*
     * If client is being changed, verify
     * that the target client exists.
     */
    if (data.clientId && data.clientId !== contact.clientId) {
      const client = await clientRepository.findById(data.clientId);

      if (!client) {
        throw new AppError(404, "Client not found.");
      }

      /*
       * A primary contact cannot simply be moved
       * away from its current client because that
       * would leave the old client without a
       * primary contact.
       */
      if (contact.isPrimary) {
        throw new AppError(
          400,
          "Primary contact cannot be moved to another client. Assign another primary contact first.",
        );
      }
    }

    if (data.email) {
      const existing = await contactPersonRepository.findByEmailExceptId(
        data.email,
        id,
      );

      if (existing) {
        throw new AppError(409, "Contact person email already exists.");
      }
    }

    /*
     * A primary contact cannot be demoted
     * without first assigning another contact.
     */
    if (contact.isPrimary && data.isPrimary === false) {
      throw new AppError(
        400,
        "Primary contact cannot be removed as primary. Assign another contact as primary first.",
      );
    }

    /*
     * If this contact is becoming primary,
     * another primary will automatically be
     * replaced by the repository transaction.
     */
    const updatedContact = await contactPersonRepository.update(id, {
      ...data,
      clientId: targetClientId,
    });

    if (!updatedContact) {
      throw new AppError(404, "Contact person not found.");
    }

    return updatedContact;
  }

  async delete(id: string) {
    const contact = await contactPersonRepository.findById(id);

    if (!contact) {
      throw new AppError(404, "Contact person not found.");
    }

    if (contact.isPrimary) {
      throw new AppError(
        400,
        "Primary contact cannot be deleted. Assign another contact as primary first.",
      );
    }

    await contactPersonRepository.delete(id);
  }

  async setPrimary(id: string) {
    const contact = await contactPersonRepository.findById(id);

    if (!contact) {
      throw new AppError(404, "Contact person not found.");
    }

    return contactPersonRepository.setPrimary(id, contact.clientId);
  }
}

export const contactPersonService = new ContactPersonService();
