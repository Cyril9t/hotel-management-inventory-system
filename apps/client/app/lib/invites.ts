import type { AxiosInstance } from "axios";

export type InviteRole =
    | "OWNER"
    | "GENERAL_MANAGER"
    | "RECEPTIONIST"
    | "BAR_STAFF"
    | "RESTAURANT_STAFF"
    | "KITCHEN_STAFF"
    | "STORE_MANAGER";

export type CreateInviteRequest = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
};

export function createStaffInvite(api: AxiosInstance, invite: CreateInviteRequest) {
    return api.post("users/invites", invite);
}
