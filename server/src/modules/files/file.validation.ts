import { z } from "zod";
import {
  FileType,
  FileModule,
} from "@prisma/client";

const fileTypes = Object.values(FileType) as [
  FileType,
  ...FileType[]
];

const fileModules = Object.values(FileModule) as [
  FileModule,
  ...FileModule[]
];

export const createFileSchema = z.object({
  body: z.object({
    fileName: z
      .string()
      .trim()
      .min(1, "File name is required.")
      .max(
        255,
        "File name cannot exceed 255 characters."
      ),

    originalName: z
      .string()
      .trim()
      .min(1, "Original file name is required.")
      .max(
        255,
        "Original file name cannot exceed 255 characters."
      ),

    filePath: z
      .string()
      .trim()
      .min(1, "File path is required."),

    fileSize: z
      .number()
      .int()
      .positive("File size must be greater than 0."),

    mimeType: z
      .string()
      .trim()
      .min(1, "MIME type is required.")
      .max(
        255,
        "MIME type cannot exceed 255 characters."
      ),

    fileType: z.enum(fileTypes),

    module: z.enum(fileModules),

    referenceId: z
      .string()
      .uuid("Invalid reference ID.")
      .optional(),
  }),
});

export const updateFileSchema = z.object({
  body: z
    .object({
      fileName: z
        .string()
        .trim()
        .min(1, "File name cannot be empty.")
        .max(
          255,
          "File name cannot exceed 255 characters."
        )
        .optional(),

      originalName: z
        .string()
        .trim()
        .min(
          1,
          "Original file name cannot be empty."
        )
        .max(
          255,
          "Original file name cannot exceed 255 characters."
        )
        .optional(),

      filePath: z
        .string()
        .trim()
        .min(1, "File path cannot be empty.")
        .optional(),

      fileSize: z
        .number()
        .int()
        .positive(
          "File size must be greater than 0."
        )
        .optional(),

      mimeType: z
        .string()
        .trim()
        .min(1, "MIME type cannot be empty.")
        .max(
          255,
          "MIME type cannot exceed 255 characters."
        )
        .optional(),

      fileType: z
        .enum(fileTypes)
        .optional(),

      module: z
        .enum(fileModules)
        .optional(),

      referenceId: z
        .string()
        .uuid("Invalid reference ID.")
        .nullable()
        .optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message:
          "At least one field is required.",
      }
    ),
});

export const fileQuerySchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .optional(),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .optional(),

    uploadedById: z
      .string()
      .uuid("Invalid uploader ID.")
      .optional(),

    module: z
      .enum(fileModules)
      .optional(),

    referenceId: z
      .string()
      .uuid("Invalid reference ID.")
      .optional(),

    fileType: z
      .enum(fileTypes)
      .optional(),

    search: z
      .string()
      .trim()
      .optional(),

    sortBy: z
      .enum([
        "createdAt",
        "fileName",
        "originalName",
        "fileSize",
        "fileType",
        "module",
      ])
      .optional(),

    sortOrder: z
      .enum(["asc", "desc"])
      .optional(),
  }),
});