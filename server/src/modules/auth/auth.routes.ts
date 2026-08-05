import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Authentication module is working.",
  });
});

export default router;