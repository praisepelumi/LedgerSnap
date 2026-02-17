import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter(
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP.`
        )
      );
    }
  },
});

/** Multer middleware that accepts a single image upload on the "image" field. */
export const uploadImage = upload.single("image");
