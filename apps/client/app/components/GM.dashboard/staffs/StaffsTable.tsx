import { useState } from 'react';
import { Search, Phone, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import CreateStaffModal from './CreateStaff';


const usersData = [
    {
        id: 1,
        name: 'Daniel Okafor',
        email: 'daniel.okafor@brandyhotel.com',
        role: 'General Manager',
        phone: '+234 803 123 4567',
        status: 'On shift',
    },
    {
        id: 2,
        name: 'Amina Bello',
        email: 'amina.bello@brandyhotel.com',
        role: 'Receptionist',
        phone: '+234 802 987 6543',
        status: 'Not on duty',
    },
    {
        id: 3,
        name: 'Chinedu Eze',
        email: 'chinedu.eze@brandyhotel.com',
        department: 'Food & Beverage',
        role: 'Store Manager',
        phone: '+234 814 555 7890',
        status: 'Not on duty',
    },
    {
        id: 4,
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@brandyhotel.com',
        department: 'Finance & Accounting',
        role: 'Bar Attendance',
        phone: '+234 809 444 3322',
        status: 'On shift',
    },
    {
        id: 5,
        name: 'Oluwaseun Adebayo',
        email: 'oluwaseun.a@brandyhotel.com',
        department: 'Operations',
        role: 'Supervisor',
        phone: '+234 818 111 2233',
        status: 'Not on duty',

    },
    {
        id: 6,
        name: 'Jones Victor',
        email: 'oluwaseun.a@brandyhotel.com',
        role: 'Kitchen',
        phone: '+234 818 111 2233',
        status: 'On shift',

    },
];

export default function AllStaff() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [createStaff, setCreateStaff] = useState(false)

    const filteredUsers = usersData.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm);
        const matchesDept = selectedDept === 'All' || user.role === selectedDept;
        return matchesSearch && matchesDept;
    });

    return (
        <div>
            <div className='mb-5 flex'>
                <div className='grow'>

                    <h3 className="text-3xl font-bold text-foreground">System Users</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage hotel staff members, departments, and contact directory.
                    </p>
                </div>

                <div>
                    <Button className="h-11 bg-brand-navy text-background" onClick={() => setCreateStaff(true)}>
                        Create Staff Account
                    </Button>
                </div>
            </div>
            <CreateStaffModal isOpen={createStaff} onClose={() => setCreateStaff(false)} />
            <Card className=''>
                <CardHeader>
                    <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>
                            <h3 className="text-xl font-bold text-foreground">Brandy Hotel Staffs and Departments</h3>
                        </div>

                        <div className="flex items-center gap-3">

                            <div className="relative w-64">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                                    <Search className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search user name or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded pl-9 pr-4 py-2 text-xs bg-secondary border border-input text-foreground placeholder-muted-foreground placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                />
                            </div>


                            <div className="relative">
                                <select
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 text-xs font-medium rounded border border-input bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
                                >
                                    <option value="All">All Role</option>
                                    {usersData.map(({ role, id }) => {
                                        return (
                                            <option key={id} value={role}>{role}</option>
                                        )
                                    })}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-secondary text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                                    <th className="py-3 px-6">Name</th>
                                    <th className="py-3 px-6">Role</th>
                                    <th className="py-3 px-6">Phone Number</th>
                                    <th className="py-3 px-6">Status</th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-xs">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-secondary/30 transition-colors group">

                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center text-xs border border-primary/20">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[15px] text-foreground">{user.name}</p>
                                                        <p className="text-[12px] text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>


                                            <td className="text-foreground font-medium text-[14px]">
                                                {user.role}
                                            </td>


                                            <td className=" text-muted-foreground flex items-center gap-1.5 pt-5">
                                                <Phone className="w-3 h-3 text-primary" />
                                                <span className='font-bold'>{user.phone}</span>
                                            </td>


                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${user.status === 'On shift'
                                                    ? 'bg-brand-success/10 text-brand-success'
                                                    : user.status === 'Not on duty'
                                                        ? 'bg-brand-gold/10 text-brand-gold'
                                                        : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-brand-success' : user.status === 'On Shift' ? 'bg-brand-gold' : 'bg-muted-foreground'
                                                        }`} />
                                                    {user.status}
                                                </span>
                                            </td>



                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            No users found matching your search criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}