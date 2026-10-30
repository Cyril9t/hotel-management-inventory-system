import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Phone, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { CreateStaffModal } from './CreateStaff';
import { UseMetricCards } from '~/Context/Context';
import { normalizeUsers, type StaffUser } from '~/lib/users';
import { UserDetailsDialog } from './UserDetailsDialog';

export default function AllStaff() {
    const { api } = UseMetricCards();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [createStaff, setCreateStaff] = useState(false);
    const [users, setUsers] = useState<StaffUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const response = await api.get('/users');
            setUsers(normalizeUsers(response.data));
        } catch {
            setLoadError('Unable to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => { void loadUsers(); }, [loadUsers]);

    const roles = useMemo(() => [...new Set(users.map((user) => user.role))], [users]);
    const filteredUsers = users.filter((user) => {
        const matchesSearch = `${user.name} ${user.email} ${user.phone}`.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch && (selectedDept === 'All' || user.role === selectedDept);
    });

    function updateUserStatus(userId: string, status: string) {
        setUsers((current) => current.map((user) => user.id === userId ? { ...user, status } : user));
        setSelectedUser((current) => current?.id === userId ? { ...current, status } : current);
    }

    return (
        <div>
            <div className='mb-5 flex items-center gap-4'><div className='grow'><h3 className="text-3xl font-bold text-foreground">System Users</h3><p className="mt-0.5 text-sm text-muted-foreground">Manage hotel staff members, departments, and contact directory.</p></div><Button className="h-11 bg-brand-navy text-background" onClick={() => setCreateStaff(true)}>Create Staff Account</Button></div>
            <CreateStaffModal isOpen={createStaff} onClose={() => { setCreateStaff(false); void loadUsers(); }} />
            <UserDetailsDialog user={selectedUser} api={api} onClose={() => setSelectedUser(null)} onUpdated={updateUserStatus} />
            <Card><CardHeader><div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-bold text-foreground">Brandy Hotel Staffs and Departments</h3>
                <div className="flex items-center gap-3"><div className="relative w-64"><Search className="absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search user name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded border border-input bg-secondary py-2 pl-9 pr-4 text-xs text-foreground placeholder:font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                    <div className="relative"><select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="cursor-pointer appearance-none rounded border border-input bg-secondary py-2 pl-3 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"><option value="All">All Roles</option>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" /></div>
                </div>
            </div></CardHeader>
                <CardContent><div className="overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr className="border-b border-border bg-secondary text-[11px] uppercase tracking-wider text-muted-foreground font-semibold"><th className="px-6 py-3">Name</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Phone Number</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Actions</th></tr></thead>
                    <tbody className="divide-y divide-border text-xs">
                        {loading ? <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Loading users…</td></tr>
                            : loadError ? <tr><td colSpan={5} className="py-8 text-center text-brand-danger">{loadError} <button className="ml-2 underline" onClick={() => void loadUsers()}>Retry</button></td></tr>
                                : filteredUsers.length ? filteredUsers.map((user) => <tr key={user.id} className="transition-colors hover:bg-secondary/30">
                                    <td className="px-6 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-accent text-xs font-bold text-accent-foreground">{user.name.charAt(0)}</div><div><p className="text-[15px] font-semibold text-foreground">{user.name}</p><p className="text-[12px] text-muted-foreground">{user.email}</p></div></div></td>
                                    <td className="text-[14px] font-medium text-foreground">{user.role}</td><td><div className="flex items-center gap-1.5 font-bold text-muted-foreground"><Phone className="h-3 w-3 text-primary" />{user.phone}</div></td>
                                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${/active|on shift/i.test(user.status) && !/inactive/i.test(user.status) ? 'bg-brand-success/10 text-brand-success' : /inactive|deactivated|disabled/i.test(user.status) ? 'bg-brand-danger/10 text-brand-danger' : 'bg-brand-gold/10 text-brand-gold'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{user.status}</span></td>
                                    <td className="px-6 py-3"><Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>View details</Button></td>
                                </tr>) : <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No users found matching your search criteria.</td></tr>}
                    </tbody>
                </table></div></CardContent>
            </Card>
        </div>
    );
}
