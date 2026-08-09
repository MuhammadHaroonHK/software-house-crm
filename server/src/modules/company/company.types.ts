export interface UpdateCompanyDTO {
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