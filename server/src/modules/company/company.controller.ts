import { Request, Response, NextFunction } from "express";
import { companyService } from "./company.service";
import { successResponse } from "../../utils/apiResponse";
import { toCompanyResponse } from "./company.mapper";

export class CompanyController {
  async find(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const company = await companyService.find();

      return successResponse(
        res,
        "Company settings fetched successfully.",
        toCompanyResponse(company)
      );
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const company = await companyService.update(req.body);

      return successResponse(
        res,
        "Company settings updated successfully.",
        toCompanyResponse(company)
      );
    } catch (error) {
      next(error);
    }
  }
}

export const companyController = new CompanyController();