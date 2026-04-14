import { SigapApiClient, type SigapLoginResponse } from "./sigap-api.client";

const sigapClient = new SigapApiClient();

export const loginToSigap = async (): Promise<SigapLoginResponse> => {
  const username = process.env.SIGAP_USERNAME?.trim();
  const password = process.env.SIGAP_PASSWORD?.trim();

  if (!username || !password) {
    throw new Error(
      "Credential SIGAP belum lengkap. Tambahkan SIGAP_USERNAME dan SIGAP_PASSWORD pada environment server."
    );
  }

  return sigapClient.login({ username, password });
};

export const getSigapApiClient = () => sigapClient;
