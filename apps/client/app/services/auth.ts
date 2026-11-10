import { api } from "~/lib/api";

export async function requestPasswordReset(email: string) {
    return api.post("auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string) {
    return api.post("auth/reset-password", { token, password });
}
