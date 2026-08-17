import { ContactPerson } from "@prisma/client";

export function toContactPersonResponse(
  contactPerson: ContactPerson & {
    client?: {
      id: string;
      companyName: string;
      email: string;
    } | null;
  }
) {
  return {
    id: contactPerson.id,

    clientId: contactPerson.clientId,

    client: contactPerson.client
      ? {
          id: contactPerson.client.id,
          companyName:
            contactPerson.client.companyName,
          email:
            contactPerson.client.email,
        }
      : null,

    firstName:
      contactPerson.firstName,

    lastName:
      contactPerson.lastName,

    fullName: `${contactPerson.firstName} ${contactPerson.lastName}`,

    designation:
      contactPerson.designation,

    email:
      contactPerson.email,

    phone:
      contactPerson.phone,

    isPrimary:
      contactPerson.isPrimary,

    createdAt:
      contactPerson.createdAt,

    updatedAt:
      contactPerson.updatedAt,
  };
}