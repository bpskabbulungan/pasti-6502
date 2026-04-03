import { Purpose } from "@/shared/constants/enums";
import {
	visitorFormClientSchema,
	type VisitorFormClientData,
	type VisitorFormClientInput,
} from "@shared/schemas/visitor-form";

export const visitorFormSchema = visitorFormClientSchema;

export type VisitorFormFormValues = VisitorFormClientInput;
export type VisitorFormValues = VisitorFormClientData;

export const visitorFormDefaultValues: Partial<VisitorFormFormValues> = {
	name: "",
	email: "",
	address: "",
	phone: "",
	age: undefined,
	institution: "",
	gender: undefined,
	lastEducation: undefined,
	occupation: "Pelajar/Mahasiswa",
	purpose: Purpose.KONSULTASI_STATISTIK,
	serviceId: "",
	queueType: "OFFLINE",
};
