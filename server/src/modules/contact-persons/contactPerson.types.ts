export interface CreateContactPersonDTO {
  clientId: string;
  firstName: string;
  lastName: string;
  designation?: string;
  email?: string;
  phone?: string;
}

export interface UpdateContactPersonDTO {
  clientId?: string;
  firstName?: string;
  lastName?: string;
  designation?: string;
  email?: string;
  phone?: string;
}