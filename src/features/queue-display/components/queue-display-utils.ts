import type { QueueDisplayResponse } from "@shared/types/queue";

export type QueueDisplayItem =
  | QueueDisplayResponse["servingQueues"][number]
  | NonNullable<QueueDisplayResponse["nextQueue"]>;

export const formatQueueCode = (serviceName: string, queueNumber: number) => {
  const trimmed = serviceName.toLowerCase();
  const prefix = trimmed.includes("dtsen")
    ? "D"
    : trimmed.includes("perpust")
    ? "P"
    : trimmed.includes("konsul")
      ? "K"
      : trimmed.includes("rekomen")
        ? "R"
        : "L";
  const padded = queueNumber.toString().padStart(3, "0");
  return `${prefix}-${padded}`;
};

export const getQueueOfficerName = (queue: QueueDisplayItem) => {
  const dutyStaffName = queue.dutyStaff?.name?.trim();
  if (dutyStaffName) {
    return dutyStaffName;
  }

  const adminName = queue.admin?.name?.trim();
  if (adminName) {
    return adminName;
  }

  return "Belum ditetapkan";
};

export const getQueueVisitorName = (queue: QueueDisplayItem) => {
  const visitorName = queue.visitor?.name?.trim();
  if (visitorName) {
    return visitorName;
  }

  const guestName = queue.guest?.fullName?.trim();
  if (guestName) {
    return guestName;
  }

  return "Belum ditetapkan";
};
