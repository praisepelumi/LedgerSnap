import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { CreateCategorySchema, UpdateCategorySchema, IdParamSchema } from "@receipt/shared";
import * as controller from "../controllers/categories.controller.js";

const router = Router();

router.get("/", controller.list);
router.post("/", validate(CreateCategorySchema), controller.create);
router.put("/:id", validate(IdParamSchema, "params"), validate(UpdateCategorySchema), controller.update);
router.delete("/:id", validate(IdParamSchema, "params"), controller.remove);

export default router;
