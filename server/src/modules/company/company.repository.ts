import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export class CompanyRepository {
  async find() {
    return prisma.companySetting.findFirst();
  }

  async upsert(data: Prisma.CompanySettingUncheckedCreateInput) {
    const existing = await prisma.companySetting.findFirst();

    if (existing) {
      return prisma.companySetting.update({
        where: {
          id: existing.id,
        },
        data,
      });
    }

    return prisma.companySetting.create({
      data,
    });
  }
}

export const companyRepository = new CompanyRepository();