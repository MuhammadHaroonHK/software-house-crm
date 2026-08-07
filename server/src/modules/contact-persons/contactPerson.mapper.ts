import { ContactPerson } from "@prisma/client";

export function toContactPersonResponse(
  contactPerson: ContactPerson
) {
  return {
    id: contactPerson.id,
    clientId: contactPerson.clientId,

    firstName: contactPerson.firstName,
    lastName: contactPerson.lastName,

    designation: contactPerson.designation,
    email: contactPerson.email,
    phone: contactPerson.phone,

    createdAt: contactPerson.createdAt,
    updatedAt: contactPerson.updatedAt,
  };
}