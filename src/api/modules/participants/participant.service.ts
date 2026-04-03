import { Gender, LastEducation, Prisma, Purpose } from "@prisma/client";

export type QueueParticipantInput = {
  fullName: string;
  phone: string;
  institution: string;
  email?: string | null;
  address?: string | null;
  age?: number | null;
  gender?: Gender | null;
  lastEducation?: LastEducation | null;
  occupation?: string | null;
  purpose?: Purpose | null;
};

export const buildVisitorCreateData = (input: QueueParticipantInput) =>
  ({
    name: input.fullName,
    phone: input.phone,
    institution: input.institution,
    email: input.email ?? null,
    address: input.address ?? null,
    age: input.age ?? null,
    gender: input.gender ?? null,
    lastEducation: input.lastEducation ?? null,
    occupation: input.occupation ?? null,
    purpose: input.purpose ?? null,
  }) satisfies Prisma.VisitorCreateInput;

export const buildGuestCreateData = (input: QueueParticipantInput) =>
  ({
    fullName: input.fullName,
    phone: input.phone,
    institution: input.institution,
    email: input.email ?? null,
    address: input.address ?? null,
    age: input.age ?? null,
    gender: input.gender ?? null,
    lastEducation: input.lastEducation ?? null,
    occupation: input.occupation ?? null,
    purpose: input.purpose ?? null,
  }) satisfies Prisma.GuestCreateInput;

export async function createVisitorParticipant(
  tx: Prisma.TransactionClient,
  input: QueueParticipantInput
) {
  return tx.visitor.create({
    data: buildVisitorCreateData(input),
  });
}

export async function createGuestParticipantPair(
  tx: Prisma.TransactionClient,
  input: QueueParticipantInput
) {
  const visitor = await createVisitorParticipant(tx, input);
  const guest = await tx.guest.create({
    data: buildGuestCreateData(input),
  });

  return { visitor, guest };
}
