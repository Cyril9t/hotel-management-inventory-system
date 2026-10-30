import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AxiosInstance } from "axios";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import type { StaffUser } from "~/lib/users";
import { getUserDetail } from "~/lib/users";

export function UserDetailsDialog({ user, api, onClose, onUpdated }: {
  user: StaffUser | null;
  api: AxiosInstance;
  onClose: () => void;
  onUpdated: (userId: string, nextStatus: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    setDetail(null);
    if (!user) return;
    let cancelled = false;
    void api.get(`users/${encodeURIComponent(user.id)}`).then((response) => {
      if (!cancelled) setDetail(getUserDetail(response.data));
    }).catch(() => {
      // List data remains available if the detail request fails.
    });
    return () => { cancelled = true; };
  }, [api, user]);

  async function deactivate() {
    if (!user) return;
    setBusy(true);
    try {
      const response = await api.patch(`users/${encodeURIComponent(user.id)}/deactivate`);
      const detail = getUserDetail(response.data);
      onUpdated(user.id, "Inactive");
      toast.success("User deactivated");
      onClose();
    } catch {
      // The API interceptor provides the request error toast.
    } finally {
      setBusy(false);
    }
  }

  const isInactive = /inactive|deactivated|disabled/i.test(detail?.status ?? user?.status ?? "") || detail?.isActive === false;
  const userDetail = detail ?? user;

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        {user && <>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">User details</DialogTitle>
            <DialogDescription>Staff account information and access status.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 rounded-lg bg-secondary p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground">{user.name.charAt(0)}</div>
            <div><p className="font-semibold text-foreground">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}</p></div>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[["Role", userDetail.role?.name ?? userDetail.role ?? user.role], ["Department", userDetail.department?.name ?? userDetail.department ?? user.department], ["Phone", userDetail.phone ?? user.phone], ["Status", userDetail.status ?? (userDetail.isActive === false ? "Inactive" : user.status)], ["User ID", userDetail.id ?? user.id], ["Joined", userDetail.createdAt ? new Date(userDetail.createdAt).toLocaleDateString() : "Not available"]].map(([label, value]) => (
              <div key={label}><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium text-foreground">{value}</dd></div>
            ))}
          </dl>
          <DialogFooter className="-mx-4 -mb-4 mt-2 flex-row justify-between">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button variant="destructive" disabled={busy || isInactive} onClick={() => void deactivate()}>{busy ? "Deactivating…" : isInactive ? "Deactivated" : "Deactivate user"}</Button>
          </DialogFooter>
        </>}
      </DialogContent>
    </Dialog>
  );
}
