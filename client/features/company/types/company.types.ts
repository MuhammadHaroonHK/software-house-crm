export interface Company {
  companyName: string;
  companyEmail: string;
  companyPhone: string | null;
  companyAddress: string | null;

  website: string | null;
  logo: string | null;

  bankName: string | null;
  accountTitle: string | null;
  accountNumber: string | null;
  iban: string | null;

  easyPaisaNumber: string | null;
  jazzCashNumber: string | null;

  currency: string;
  timezone: string;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyPayload {
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;

  website?: string;
  logo?: string;

  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  iban?: string;

  easyPaisaNumber?: string;
  jazzCashNumber?: string;

  currency?: string;
  timezone?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}