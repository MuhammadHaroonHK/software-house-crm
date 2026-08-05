import { Prisma } from "@prisma/client";

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    role: {
      select: {
        id: true;
        name: true;
      };
    };
    department: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

export function toUserResponse(user: UserWithRelations) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    status: user.status,

    role: user.role,

    department: user.department,

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}