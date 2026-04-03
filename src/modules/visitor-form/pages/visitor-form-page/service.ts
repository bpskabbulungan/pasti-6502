import { visitorFormApi } from "@/services/api/visitor-form";
import type { VisitorFormValues } from "./schema";

export const visitorFormPageService = {
	track: (uuid: string, hash?: string) => visitorFormApi.track(uuid, hash),
	getServices: (uuid: string) => visitorFormApi.getServices(uuid),
	getDynamicUuid: (uuid: string) => visitorFormApi.getDynamicUuid(uuid),
	submit: (payload: VisitorFormValues & { tempUuid: string }) => visitorFormApi.submit(payload),
	markSkd: (tempUuid: string, filled: boolean) => visitorFormApi.markSkd(tempUuid, filled),
};
