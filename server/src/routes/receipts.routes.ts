import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { uploadImage } from "../middleware/upload.js";
import {
  ReceiptFilterSchema,
  UpdateReceiptSchema,
  AssignCategorySchema,
  IdParamSchema,
} from "@receipt/shared";
import * as controller from "../controllers/receipts.controller.js";

const router = Router();

router.post("/parse", uploadImage, controller.parse);
router.get("/", validate(ReceiptFilterSchema, "query"), controller.list);
router.get("/:id", validate(IdParamSchema, "params"), controller.getById);
router.put("/:id", validate(IdParamSchema, "params"), validate(UpdateReceiptSchema), controller.update);
router.delete("/:id", validate(IdParamSchema, "params"), controller.remove);
router.put("/:id/category", validate(IdParamSchema, "params"), validate(AssignCategorySchema), controller.assignCategory);

export default router;
