import { Router } from "express";
import { successResponse } from "../utils/apiResponse";

const router = Router();

router.get("/", (req, res) => {
  return successResponse(
    res,
    "Software House CRM API is running.",
    {
      version: "1.0.0",
      status: "OK",
    }
  );
});

export default router;