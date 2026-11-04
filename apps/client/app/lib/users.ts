export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  department: string;
  status: string;
  createdAt?: string;
};

function displayValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function normalizeUsers(payload: any): StaffUser[] {
  const users = Array.isArray(payload) ? payload
    : Array.isArray(payload?.data?.users) ? payload.data.users
      : Array.isArray(payload?.data) ? payload.data
        : Array.isArray(payload?.users) ? payload.users : [];

  return users.map((user: any, index: number) => {
    const firstName = displayValue(user?.firstName ?? user?.first_name, "");
    const lastName = displayValue(user?.lastName ?? user?.last_name, "");
    return {
      id: String(user?._id ?? user?.id ?? user?.userId ?? index),
      name: displayValue(user?.name ?? user?.fullName ?? user?.full_name, `${firstName} ${lastName}`.trim() || "Unnamed user"),
      email: displayValue(user?.email, "No email provided"),
      role: displayValue(user?.role?.name ?? user?.role, "Staff"),
      phone: displayValue(user?.phone ?? user?.phoneNumber ?? user?.phone_number, "Not provided"),
      department: displayValue(user?.department?.name ?? user?.department, "Not assigned"),
      status: displayValue(user?.status, user?.isActive === false || user?.is_active === false ? "Inactive" : "Active"),
      createdAt: user?.createdAt ?? user?.created_at,
    };
  });
}

export function getUserDetail(payload: any) {
  return payload?.data?.user ?? payload?.data ?? payload?.user ?? payload;
}
