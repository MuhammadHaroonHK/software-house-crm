export interface CreateClientDTO {
  companyName: string;
  industry?: string;
  website?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

export interface UpdateClientDTO {
  companyName?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}