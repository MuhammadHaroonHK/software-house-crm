import { FileModule, FileType } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";
import {
  CreateFileDTO,
  UpdateFileDTO,
} from "./file.types";
import { FileRepository } from "./file.repository";

const fileRepository = new FileRepository();

export class FileService {
  async create(data: CreateFileDTO) {
    const user =
      await fileRepository.findUserById(
        data.uploadedById
      );

    if (!user) {
      throw new AppError(
        404,
        "Uploader not found."
      );
    }

    const reference =
      await fileRepository.findReference(
        data.module,
        data.referenceId
      );

    if (data.referenceId && !reference) {
      throw new AppError(
        404,
        `Referenced ${data.module.toLowerCase()} not found.`
      );
    }

    return fileRepository.create({
      fileName: data.fileName,
      originalName: data.originalName,
      filePath: data.filePath,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      fileType: data.fileType,
      module: data.module,

      ...(data.referenceId && {
        referenceId: data.referenceId,
      }),

      uploadedBy: {
        connect: {
          id: data.uploadedById,
        },
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    uploadedById?: string;
    module?: FileModule;
    referenceId?: string;
    fileType?: FileType;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const pagination =
      getPagination(query);

    if (query.uploadedById) {
      const user =
        await fileRepository.findUserById(
          query.uploadedById
        );

      if (!user) {
        throw new AppError(
          404,
          "Uploader not found."
        );
      }
    }

    if (query.referenceId && query.module) {
      const reference =
        await fileRepository.findReference(
          query.module,
          query.referenceId
        );

      if (!reference) {
        throw new AppError(
          404,
          `Referenced ${query.module.toLowerCase()} not found.`
        );
      }
    }

    const { files, total } =
      await fileRepository.findAll(
        pagination.skip,
        pagination.limit,
        pagination.search,
        query.uploadedById,
        query.module,
        query.referenceId,
        query.fileType,
        pagination.sortBy,
        pagination.sortOrder
      );

    return {
      data: files,

      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(
          total / pagination.limit
        ),
      },
    };
  }

  async findById(id: string) {
    const file =
      await fileRepository.findById(id);

    if (!file) {
      throw new AppError(
        404,
        "File not found."
      );
    }

    return file;
  }

  async update(
    id: string,
    data: UpdateFileDTO
  ) {
    const file =
      await fileRepository.findById(id);

    if (!file) {
      throw new AppError(
        404,
        "File not found."
      );
    }

    let referenceData:
      | { referenceId: string }
      | { referenceId: null }
      | Record<string, never> = {};

    if (
      data.referenceId !== undefined ||
      data.module !== undefined
    ) {
      const module =
        data.module ?? file.module;

      const referenceId =
        data.referenceId !== undefined
          ? data.referenceId
          : file.referenceId;

      if (referenceId) {
        const reference =
          await fileRepository.findReference(
            module,
            referenceId
          );

        if (!reference) {
          throw new AppError(
            404,
            `Referenced ${module.toLowerCase()} not found.`
          );
        }

        referenceData = {
          referenceId,
        };
      } else {
        referenceData = {
          referenceId: null,
        };
      }
    }

    return fileRepository.update(
      id,
      {
        ...(data.fileName !== undefined && {
          fileName: data.fileName,
        }),

        ...(data.originalName !== undefined && {
          originalName: data.originalName,
        }),

        ...(data.filePath !== undefined && {
          filePath: data.filePath,
        }),

        ...(data.fileSize !== undefined && {
          fileSize: data.fileSize,
        }),

        ...(data.mimeType !== undefined && {
          mimeType: data.mimeType,
        }),

        ...(data.fileType !== undefined && {
          fileType: data.fileType,
        }),

        ...(data.module !== undefined && {
          module: data.module,
        }),

        ...referenceData,
      }
    );
  }

  async delete(id: string) {
    const file =
      await fileRepository.findById(id);

    if (!file) {
      throw new AppError(
        404,
        "File not found."
      );
    }

    await fileRepository.delete(id);
  }
}