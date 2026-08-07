import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";
import { MeetingStatus, UserRole } from "@prisma/client";
import { CreateMeetingDTO, UpdateMeetingDTO } from "./meeting.types";
import { MeetingRepository } from "./meeting.repository";

const meetingRepository = new MeetingRepository();

export class MeetingService {
  async create(data: CreateMeetingDTO) {
    const project = await meetingRepository.findProjectById(data.projectId);

    if (!project) {
      throw new AppError(404, "Project not found.");
    }

    const organizer = await meetingRepository.findOrganizerById(
      data.organizerId,
    );

    if (!organizer) {
      throw new AppError(404, "Organizer not found.");
    }

    if (
      organizer.role.name !== UserRole.PROJECT_MANAGER &&
      organizer.role.name !== UserRole.SUPER_ADMIN
    ) {
      throw new AppError(
        400,
        "Organizer must be a Super Admin or Project Manager.",
      );
    }

    const isMember = await meetingRepository.isProjectMember(
      data.projectId,
      data.organizerId,
    );

    if (!isMember) {
      throw new AppError(400, "Organizer is not a member of this project.");
    }

    return meetingRepository.create({
      title: data.title,
      agenda: data.agenda,

      meetingDate: new Date(data.meetingDate),

      location: data.location,
      notes: data.notes,
      aiSummary: data.aiSummary,

      ...(data.status && {
        status: data.status,
      }),

      project: {
        connect: {
          id: data.projectId,
        },
      },

      organizer: {
        connect: {
          id: data.organizerId,
        },
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: MeetingStatus;
    projectId?: string;
    organizerId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const pagination = getPagination(query);

    const { meetings, total } = await meetingRepository.findAll(
      pagination.skip,
      pagination.limit,
      pagination.search,
      query.status,
      query.projectId,
      query.organizerId,
      pagination.sortBy,
      pagination.sortOrder,
    );

    return {
      data: meetings,

      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findById(id: string) {
    const meeting = await meetingRepository.findById(id);

    if (!meeting) {
      throw new AppError(404, "Meeting not found.");
    }

    return meeting;
  }

  async update(id: string, data: UpdateMeetingDTO) {
    const meeting = await meetingRepository.findById(id);

    if (!meeting) {
      throw new AppError(404, "Meeting not found.");
    }

    let projectData = {};

    if (data.projectId) {
      const project = await meetingRepository.findProjectById(data.projectId);

      if (!project) {
        throw new AppError(404, "Project not found.");
      }

      projectData = {
        project: {
          connect: {
            id: data.projectId,
          },
        },
      };
    }

    let organizerData = {};

    if (data.organizerId) {
      const organizer = await meetingRepository.findOrganizerById(
        data.organizerId,
      );

      if (!organizer) {
        throw new AppError(404, "Organizer not found.");
      }

      if (
        organizer.role.name !== UserRole.PROJECT_MANAGER &&
        organizer.role.name !== UserRole.SUPER_ADMIN
      ) {
        throw new AppError(
          400,
          "Organizer must be a Super Admin or Project Manager.",
        );
      }

      const projectId = data.projectId ?? meeting.projectId;

      const isMember = await meetingRepository.isProjectMember(
        projectId,
        data.organizerId,
      );

      if (!isMember) {
        throw new AppError(400, "Organizer is not a member of this project.");
      }

      organizerData = {
        organizer: {
          connect: {
            id: data.organizerId,
          },
        },
      };
    }

    return meetingRepository.update(id, {
      ...(data.title && {
        title: data.title,
      }),

      ...(data.agenda !== undefined && {
        agenda: data.agenda,
      }),

      ...(data.meetingDate && {
        meetingDate: new Date(data.meetingDate),
      }),

      ...(data.location !== undefined && {
        location: data.location,
      }),

      ...(data.notes !== undefined && {
        notes: data.notes,
      }),

      ...(data.aiSummary !== undefined && {
        aiSummary: data.aiSummary,
      }),

      ...(data.status && {
        status: data.status,
      }),

      ...projectData,

      ...organizerData,
    });
  }

  async delete(id: string) {
    const meeting = await meetingRepository.findById(id);

    if (!meeting) {
      throw new AppError(404, "Meeting not found.");
    }

    await meetingRepository.delete(id);
  }
}
