import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { ExportRequestSchema } from "@receipt/shared";
import * as controller from "../controllers/export.controller.js";

const router = Router();

router.post("/", validate(ExportRequestSchema), controller.exportCsv);

export default router;
