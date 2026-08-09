import { companyRepository } from "./company.repository";
import { AppError } from "../../utils/AppError";
import { UpdateCompanyDTO } from "./company.types";

export class CompanyService {
  async find() {
    const company = await companyRepository.find();

    if (!company) {
      throw new AppError(
        404,
        "Company settings not found."
      );
    }

    return company;
  }

  async update(data: UpdateCompanyDTO) {
    const existing = await companyRepository.find();

    const company = await companyRepository.upsert({
      ...(existing && {
        id: existing.id,
      }),

      companyName:
        data.companyName ??
        existing?.companyName ??
        "",

      companyEmail:
        data.companyEmail ??
        existing?.companyEmail ??
        "",

      companyPhone:
        data.companyPhone ??
        existing?.companyPhone,

      companyAddress:
        data.companyAddress ??
        existing?.companyAddress,

      website:
        data.website ??
        existing?.website,

      logo:
        data.logo ??
        existing?.logo,

      bankName:
        data.bankName ??
        existing?.bankName,

      accountTitle:
        data.accountTitle ??
        existing?.accountTitle,

      accountNumber:
        data.accountNumber ??
        existing?.accountNumber,

      easyPaisaNumber:
        data.easyPaisaNumber ??
        existing?.easyPaisaNumber,

      jazzCashNumber:
        data.jazzCashNumber ??
        existing?.jazzCashNumber,

      iban:
  data.iban ??
  existing?.iban,

      currency:
        data.currency ??
        existing?.currency ??
        "PKR",

      timezone:
        data.timezone ??
        existing?.timezone ??
        "Asia/Karachi",
    });

    return company;
  }
}

export const companyService = new CompanyService();