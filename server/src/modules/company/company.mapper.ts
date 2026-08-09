import { CompanySetting } from "@prisma/client";

export function toCompanyResponse(
  company: CompanySetting
) {
  return {
    companyName: company.companyName,
    companyEmail: company.companyEmail,
    companyPhone: company.companyPhone,
    companyAddress: company.companyAddress,

    website: company.website,
    logo: company.logo,

    bankName: company.bankName,
    accountTitle: company.accountTitle,
    accountNumber: company.accountNumber,
    iban: company.iban,

    easyPaisaNumber: company.easyPaisaNumber,
    jazzCashNumber: company.jazzCashNumber,

    currency: company.currency,
    timezone: company.timezone,

    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}