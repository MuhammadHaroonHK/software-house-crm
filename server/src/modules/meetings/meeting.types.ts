import { MeetingStatus } from "@prisma/client";

export interface CreateMeetingDTO {
  projectId: string;
  organizerId: string;

  title: string;
  agenda?: string;

  meetingDate: string;

  location?: string;
  notes?: string;
  aiSummary?: string;

  status?: MeetingStatus;
}

export interface UpdateMeetingDTO {
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