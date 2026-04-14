import { apiFetch } from "./base-client";
import type {
  PstOfficersListResponse,
  PstOfficerCandidateSummary,
  PstSyncResponse,
} from "@shared/types/pst-officers";

export const pstOfficersApi = {
  list: () => apiFetch<PstOfficersListResponse>("/api/pst/officers"),
  sync: () =>
    apiFetch<PstSyncResponse>("/api/pst/officers/sync", {
      method: "POST",
      body: {},
    }),
  setActive: (id: string, isActiveCandidate: boolean) =>
    apiFetch<{ officer: PstOfficerCandidateSummary }>(`/api/pst/officers/${id}/active`, {
      method: "PATCH",
      body: { isActiveCandidate },
    }),
};
