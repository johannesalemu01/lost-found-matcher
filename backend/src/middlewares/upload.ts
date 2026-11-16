import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { MAX_PHOTO_BYTES } from "../config/env";
import { badRequest } from "../utils/errors";

/**
 * Optional single photo upload (field "photo"), kept in memory so it can be checked
 * before anything touches the disk. Multipart requests carry the report fields as a
 * JSON string in the "data" field; plain JSON requests are left untouched.
 */
const single = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_BYTES, files: 1, fields: 5 },
}).single("photo");

export function optionalPhotoUpload(req: Request, res: Response, next: NextFunction) {
  if (!req.is("multipart/form-data")) return next();
  single(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? `The photo is too large (max ${MAX_PHOTO_BYTES / 1024 / 1024} MB).`
          : "Only one photo can be attached.";
      return next(badRequest(message, { photo: message }));
    }
    if (err) return next(err);
    if (typeof req.body?.data === "string") {
      try {
        req.body = JSON.parse(req.body.data);
      } catch {
        return next(badRequest("Report data is not valid JSON."));
      }
    }
    next();
  });
}
