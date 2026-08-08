import {
  FileType,
  FileModule,
} from "@prisma/client";

export interface CreateFileDTO {
  uploadedById: string;

  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: FileType;
  module: FileModule;
  referenceId?: string;
}

export interface UpdateFileDTO {
  fileName?: string;
  originalName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  fileType?: FileType;
  module?: FileModule;
  referenceId?: string | null;
}

export interface FileQueryDTO {
  page?: number;
  limit?: number;
  uploadedById?: string;
  module?: FileModule;
  referenceId?: string;
  fileType?: FileType;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}