export type MeetingStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED";

export interface MeetingProject {
  id: string;
  name: string;
  status:
    | "PLANNING"
    | "IN_PROGRESS"
    | "ON_HOLD"
    | "COMPLETED"
    | "CANCELLED";
}

export interface MeetingOrganizer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;

  role: {
    id: string;
    name:
      | "SUPER_ADMIN"
      | "PROJECT_MANAGER"
      | "EMPLOYEE"
      | "CLIENT";
  };
}

export interface Meeting {
  id: string;

  projectId: string;
  organizerId: string;

  title: string;
  agenda: string | null;

  meetingDate: string;

  location: string | null;

  notes: string | null;
  aiSummary: string | null;

  status: MeetingStatus;

  createdAt: string;
  updatedAt: string;

  project: MeetingProject;
  organizer: MeetingOrganizer;
}

export interface MeetingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MeetingListResponse {
  success: boolean;
  message: string;
  data: Meeting[];
  meta: MeetingPagination;
}

export interface MeetingResponse {
  success: boolean;
  message: string;
  data: Meeting;
}

export interface MeetingMutationResponse {
  success: boolean;
  message: string;
  data: Meeting | null;
}

export interface CreateMeetingPayload {
  projectId: string;
  organizerId: string;

  title: string;
  agenda?: string;

  meetingDate: string;

  location?: string;
  notes?: string;

  status?: MeetingStatus;
}

export interface UpdateMeetingPayload {
  projectId?: string;
  organizerId?: string;

  title?: string;
  agenda?: string;

  meetingDate?: string;

  location?: string | null;
  notes?: string | null;
  aiSummary?: string | null;

  status?: MeetingStatus;
}

export interface MeetingQueryParams {
  page?: number;
  limit?: number;

  search?: string;

  projectId?: string;
  organizerId?: string;

  status?: MeetingStatus;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}