import { Client } from "@prisma/client";

export function toClientResponse(client: Client) {
  return {
    id: client.id,
    companyName: client.companyName,
    industry: client.industry,
    website: client.website,
    email: client.email,
    phone: client.phone,
    address: client.address,
    city: client.city,
    country: client.country,
    notes: client.notes,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
}