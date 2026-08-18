export interface MeetingParticipant {
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

  joinedAt: string;
}

export interface MeetingParticipantsResponse {
  success: boolean;
  message: string;
  data: MeetingParticipant[];
}

export interface MeetingParticipantMutationResponse {
  success: boolean;
  message: string;
  data: {
    user: {
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
    };
  } | null;
}

export interface AddMeetingParticipantPayload {
  userId: string;
}