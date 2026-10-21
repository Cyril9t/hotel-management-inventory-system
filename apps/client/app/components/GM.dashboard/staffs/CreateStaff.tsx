import { useState } from 'react';
import { X, ChevronDown, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '~/components/ui/button';

export interface StaffFormData {
    fullName: string;
    email: string;
    phoneCode: string;
    phoneNumber: string;
    department: string;
    role: string;
    password: string;
    confirmPassword: string;
}

export interface CreateStaffModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSubmit?: (data: StaffFormData) => void;
}

export const CreateStaffModal: React.FC<CreateStaffModalProps> = ({
    isOpen = true,
    onClose = () => { },
    onSubmit = () => { },
}) => {
    const [formData, setFormData] = useState<StaffFormData>({
        fullName: '',
        email: '',
        phoneCode: '+234',
        phoneNumber: '',
        department: '',
        role: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleChange = (field: keyof StaffFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        onSubmit(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200">

            <div className="relative w-full max-w-2xl bg-card border border-border rounded-[var(--radius)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">


                <div className="flex items-start justify-between p-6 pb-4 border-b border-border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-accent text-accent-foreground">
                            <UserPlus className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">
                                Create Staff
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Add a new staff member to the system.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>


                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-foreground mb-4">
                            Staff Information
                        </h3>


                        {error && (
                            <div className="mb-4 p-3 rounded-[var(--radius)] bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                                {error}
                            </div>
                        )}


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter full name"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    className="w-full px-3.5 py-2 text-xs rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                />
                            </div>


                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Role
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.role}
                                        onChange={(e) => handleChange('role', e.target.value)}
                                        className="w-full appearance-none px-3.5 py-2 text-xs rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
                                    >
                                        <option value="" disabled>Select role</option>
                                        <option value="Front Desk Receptionist">Front Desk Receptionist</option>
                                        <option value="Concierge Executive">Concierge Executive</option>
                                        <option value="F&B Waiter / Staff">F&B Waiter / Staff</option>
                                        <option value="Housekeeping Associate">Housekeeping Associate</option>
                                        <option value="Kitchen Chef / Line Cook">Kitchen Chef / Line Cook</option>
                                        <option value="Inventory Manager">Inventory Manager</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5 pointer-events-none" />
                                </div>
                            </div>


                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="w-full px-3.5 py-2 text-xs rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Phone Number
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative w-28">
                                        <select
                                            value={formData.phoneCode}
                                            onChange={(e) => handleChange('phoneCode', e.target.value)}
                                            className="w-full appearance-none pl-3 pr-7 py-2 text-xs font-medium rounded-[var(--radius)] border border-input bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
                                        >
                                            <option value="+234">🇳🇬 +234</option>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+44">🇬🇧 +44</option>
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Enter phone number"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                        className="flex-1 px-3.5 py-2 text-xs rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    />
                                </div>
                            </div>


                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        className="w-full pl-3.5 pr-10 py-2 text-xs rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>


                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Department
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.department}
                                        onChange={(e) => handleChange('department', e.target.value)}
                                        className="w-full appearance-none px-3.5 py-2 text-xs rounded-[var(--radius)] border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
                                    >
                                        <option value="" disabled>Select department</option>
                                        <option value="Front Desk & Concierge">Front Desk & Concierge</option>
                                        <option value="Food & Beverage">Food & Beverage</option>
                                        <option value="Housekeeping & Maintenance">Housekeeping & Maintenance</option>
                                        <option value="Kitchen Operations">Kitchen Operations</option>
                                        <option value="Store & Logistics">Store & Logistics</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5 pointer-events-none" />
                                </div>
                            </div>


                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                        className="w-full pl-3.5 pr-10 py-2 text-xs rounded-[var(--radius)] border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>


                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                        <Button
                            type="button"
                            variant={"outline"}
                            onClick={onClose}
                            className="h-9 w-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="h-9 w-50 "
                        >
                            Create Staff
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateStaffModal;