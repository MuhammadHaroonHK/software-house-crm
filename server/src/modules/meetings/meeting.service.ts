import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";

import {
  MeetingStatus,
  ProjectStatus,
  UserRole,
} from "@prisma/client";

import {
  CreateMeetingDTO,
  UpdateMeetingDTO,
} from "./meeting.types";

import { MeetingRepository } from "./meeting.repository";

const meetingRepository =
  new MeetingRepository();

export class MeetingService {
  /*
   * Management access:
   * SUPER_ADMIN or the project's manager.
   */
  private validateProjectAccess(
    project: {
      managerId: string;
      status: ProjectStatus;
    },
    actorId: string,
    actorRole: UserRole
  ) {
    if (
      actorRole !==
        UserRole.SUPER_ADMIN &&
      project.managerId !== actorId
    ) {
      throw new AppError(
        403,
        "Only the project manager can manage meetings for this project."
      );
    }
  }

  /*
   * Read access:
   *
   * SUPER_ADMIN:
   *   Can view everything.
   *
   * PROJECT_MANAGER:
   *   Can view meetings from projects they manage.
   *
   * EMPLOYEE:
   *   Can view meetings from projects they are a member of.
   */
  private async validateMeetingViewAccess(
    projectId: string,
    projectManagerId: string,
    actorId: string,
    actorRole: UserRole
  ) {
    if (
      actorRole ===
      UserRole.SUPER_ADMIN
    ) {
      return;
    }

    if (
      actorRole ===
        UserRole.PROJECT_MANAGER &&
      projectManagerId === actorId
    ) {
      return;
    }

    if (
      actorRole ===
      UserRole.EMPLOYEE
    ) {
      const isMember =
        await meetingRepository.isProjectMember(
          projectId,
          actorId
        );

      if (isMember) {
        return;
      }
    }

    throw new AppError(
      403,
      "You do not have access to this meeting."
    );
  }

  private validateProjectStatus(
    status: ProjectStatus
  ) {
    if (
      status ===
        ProjectStatus.COMPLETED ||
      status ===
        ProjectStatus.CANCELLED
    ) {
      throw new AppError(
        400,
        "Meetings cannot be modified for a completed or cancelled project."
      );
    }
  }

  private validateMeetingDate(
    meetingDate: Date
  ) {
    if (
      meetingDate.getTime() <
      Date.now()
    ) {
      throw new AppError(
        400,
        "Meeting date must be in the future."
      );
    }
  }

  async create(
    data: CreateMeetingDTO,
    actorId: string,
    actorRole: UserRole
  ) {
    const project =
      await meetingRepository.findProjectById(
        data.projectId
      );

    if (!project) {
      throw new AppError(
        404,
        "Project not found."
      );
    }

    this.validateProjectStatus(
      project.status
    );

    this.validateProjectAccess(
      project,
      actorId,
      actorRole
    );

    const organizer =
      await meetingRepository.findOrganizerById(
        data.organizerId
      );

    if (!organizer) {
      throw new AppError(
        404,
        "Organizer not found."
      );
    }

    if (
      organizer.role.name !==
        UserRole.PROJECT_MANAGER &&
      organizer.role.name !==
        UserRole.SUPER_ADMIN
    ) {
      throw new AppError(
        400,
        "Organizer must be a Super Admin or Project Manager."
      );
    }

    const isMember =
      await meetingRepository.isProjectMember(
        data.projectId,
        data.organizerId
      );

    if (!isMember) {
      throw new AppError(
        400,
        "Organizer is not a member of this project."
      );
    }

    const meetingDate =
      new Date(
        data.meetingDate
      );

    this.validateMeetingDate(
      meetingDate
    );

    return meetingRepository.create({
      title: data.title,

      agenda: data.agenda,

      meetingDate,

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

  async findAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: MeetingStatus;
      projectId?: string;
      organizerId?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
    actorId: string,
    actorRole: UserRole
  ) {
    const pagination =
      getPagination(query);

    const accessibleProjectIds =
      await meetingRepository.getAccessibleProjectIds(
        actorId,
        actorRole
      );

    const projectId =
      query.projectId;

    /*
     * If a specific project was requested,
     * verify that the actor can access it.
     */
    if (
      actorRole !==
        UserRole.SUPER_ADMIN &&
      projectId &&
      !accessibleProjectIds.includes(
        projectId
      )
    ) {
      throw new AppError(
        403,
        "You do not have access to meetings for this project."
      );
    }

    const {
      meetings,
      total,
    } =
      await meetingRepository.findAll(
        pagination.skip,
        pagination.limit,
        pagination.search,
        query.status,
        projectId,
        query.organizerId,
        pagination.sortBy,
        pagination.sortOrder,
        actorId,
        actorRole
      );

    return {
      data: meetings,

      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages:
          Math.ceil(
            total /
              pagination.limit
          ),
      },
    };
  }

  async findById(
    id: string,
    actorId: string,
    actorRole: UserRole
  ) {
    const meeting =
      await meetingRepository.findById(
        id
      );

    if (!meeting) {
      throw new AppError(
        404,
        "Meeting not found."
      );
    }

    await this.validateMeetingViewAccess(
      meeting.project.id,
      meeting.project.managerId,
      actorId,
      actorRole
    );

    return meeting;
  }

  async update(
    id: string,
    data: UpdateMeetingDTO,
    actorId: string,
    actorRole: UserRole
  ) {
    const meeting =
      await meetingRepository.findById(
        id
      );

    if (!meeting) {
      throw new AppError(
        404,
        "Meeting not found."
      );
    }

    this.validateProjectStatus(
      meeting.project.status
    );

    this.validateProjectAccess(
      meeting.project,
      actorId,
      actorRole
    );

    let projectData = {};

    let projectId =
      meeting.projectId;

    if (data.projectId) {
      const project =
        await meetingRepository.findProjectById(
          data.projectId
        );

      if (!project) {
        throw new AppError(
          404,
          "Project not found."
        );
      }

      this.validateProjectStatus(
        project.status
      );

      this.validateProjectAccess(
        project,
        actorId,
        actorRole
      );

      projectId =
        data.projectId;

      projectData = {
        project: {
          connect: {
            id:
              data.projectId,
          },
        },
      };
    }

    let organizerData = {};

    if (data.organizerId) {
      const organizer =
        await meetingRepository.findOrganizerById(
          data.organizerId
        );

      if (!organizer) {
        throw new AppError(
          404,
          "Organizer not found."
        );
      }

      if (
        organizer.role.name !==
          UserRole.PROJECT_MANAGER &&
        organizer.role.name !==
          UserRole.SUPER_ADMIN
      ) {
        throw new AppError(
          400,
          "Organizer must be a Super Admin or Project Manager."
        );
      }

      const isMember =
        await meetingRepository.isProjectMember(
          projectId,
          data.organizerId
        );

      if (!isMember) {
        throw new AppError(
          400,
          "Organizer is not a member of this project."
        );
      }

      organizerData = {
        organizer: {
          connect: {
            id:
              data.organizerId,
          },
        },
      };
    }

    if (data.meetingDate) {
      this.validateMeetingDate(
        new Date(
          data.meetingDate
        )
      );
    }

    return meetingRepository.update(
      id,
      {
        ...(data.title && {
          title:
            data.title,
        }),

        ...(data.agenda !==
          undefined && {
          agenda:
            data.agenda,
        }),

        ...(data.meetingDate && {
          meetingDate:
            new Date(
              data.meetingDate
            ),
        }),

        ...(data.location !==
          undefined && {
          location:
            data.location,
        }),

        ...(data.notes !==
          undefined && {
          notes:
            data.notes,
        }),

        ...(data.aiSummary !==
          undefined && {
          aiSummary:
            data.aiSummary,
        }),

        ...(data.status && {
          status:
            data.status,
        }),

        ...projectData,
        ...organizerData,
      }
    );
  }

  async delete(
    id: string,
    actorId: string,
    actorRole: UserRole
  ) {
    const meeting =
      await meetingRepository.findById(
        id
      );

    if (!meeting) {
      throw new AppError(
        404,
        "Meeting not found."
      );
    }

    this.validateProjectStatus(
      meeting.project.status
    );

    this.validateProjectAccess(
      meeting.project,
      actorId,
      actorRole
    );

    await meetingRepository.delete(
      id
    );
  }

  async changeStatus(
  id: string,
  newStatus: MeetingStatus,
  actorId: string,
  actorRole: UserRole
) {
  const meeting =
    await meetingRepository.findById(id);

  if (!meeting) {
    throw new AppError(
      404,
      "Meeting not found."
    );
  }

  this.validateProjectStatus(
    meeting.project.status
  );

  this.validateProjectAccess(
    meeting.project,
    actorId,
    actorRole
  );

  const currentStatus =
    meeting.status;

  if (
    currentStatus ===
    newStatus
  ) {
    throw new AppError(
      400,
      `Meeting is already ${newStatus.toLowerCase()}.`
    );
  }

  /*
   * Terminal states cannot be changed.
   */
  if (
    currentStatus ===
      MeetingStatus.COMPLETED ||
    currentStatus ===
      MeetingStatus.CANCELLED
  ) {
    throw new AppError(
      400,
      `Meeting cannot transition from ${currentStatus.toLowerCase()}.`
    );
  }

  /*
   * Meeting workflow:
   *
   * SCHEDULED
   *    ├──> COMPLETED
   *    └──> CANCELLED
   */
  const allowedTransitions:
    Record<
      MeetingStatus,
      MeetingStatus[]
    > = {
    [MeetingStatus.SCHEDULED]: [
      MeetingStatus.COMPLETED,
      MeetingStatus.CANCELLED,
    ],

    [MeetingStatus.COMPLETED]: [],

    [MeetingStatus.CANCELLED]: [],
  };

  const allowed =
    allowedTransitions[
      currentStatus
    ];

  if (
    !allowed.includes(
      newStatus
    )
  ) {
    throw new AppError(
      400,
      `Invalid meeting status transition from ${currentStatus} to ${newStatus}.`
    );
  }

  return meetingRepository.updateStatus(
    id,
    newStatus
  );
}
}

export const meetingService =
  new MeetingService();