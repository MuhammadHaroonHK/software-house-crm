import { z, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: z.ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if ("body" in validatedData) {
        req.body = validatedData.body;
      }

      if ("query" in validatedData) {
        req.query = validatedData.query as Request["query"];
      }

      if ("params" in validatedData) {
        req.params = validatedData.params as Request["params"];
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed.",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      next(error);
    }
  };