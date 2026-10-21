import { useState } from 'react';
import { X, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader } from '~/components/ui/card';
import { Button } from '~/components/ui/button';


export function CreateGMModal({ isOpen = true, onClose = () => { } }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneCode: '+234',
        phoneNumber: '',
        role: 'General Manager',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;



    const handleSubmit = (e: any) => {
        e.preventDefault();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200">

            <div className="relative w-full max-w-2xl ">
                <Card>
                    <CardHeader >
                        <div className="flex items-start justify-between p-4">
                            <div>
                                <h2 className="text-xl font-bold  text-foreground">
                                    Create General Manager
                                </h2>
                                <p className="text-muted-foreground mt-0.5">
                                    Add a new General Manager to the system.
                                </p>
                            </div>

                            <CardAction>

                                <Button
                                    variant={"outline"}
                                    onClick={onClose}
                                    className="h-10 w-10 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </CardAction>

                        </div>

                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">


                            <div>


                                <h3 className="font-semibold text-foreground mb-4">
                                    General Manager Details
                                </h3>


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
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full px-3.5 py-2 text-[12px] font-semibold rounded-[10px] border-2 border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                        />
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
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3.5 py-2 text-[12px] font-semibold rounded-[10px] border-2 border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                        />
                                    </div>


                                    <div className="space-y-3 ">
                                        <div>
                                            <label className="text-xs font-semibold text-foreground">
                                                Phone Number
                                            </label>
                                            <div className="flex gap-2">
                                                <div className="relative w-28">
                                                    <select
                                                        value={formData.phoneCode}
                                                        onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                                                        className="w-full appearance-none pl-3 pr-7 py-2 font-medium rounded-[10px] border-2 border-input bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
                                                    >
                                                        <option value="+234">NG +234</option>
                                                        <option value="+1">US +1</option>
                                                        <option value="+44">BG +44</option>
                                                    </select>
                                                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="Enter phone number"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                    className="flex-1 w-full px-3.5 py-2 text-[12px] font-semibold rounded-[10px] border-2 border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>

                                        <label className="text-xs font-semibold text-foreground">
                                            Role
                                        </label>

                                        <div className="relative">
                                            <select
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                className="w-full appearance-none px-3.5 py-2 text-xs rounded-[10px] border-2 border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
                                            >
                                                <option value="General Manager">General Manager</option>
                                                <option value="Assistant Manager">Assistant Manager</option>
                                                <option value="Operations Manager">Operations Manager</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                                <br />

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-foreground">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="Create a password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-3.5 pr-10 py-2 text-xs rounded-[10px] border-2 border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
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
                            </div>
                        </form>

                    </CardContent>

                    <CardFooter className='justify-center bg-brand-navy-light' >

                        <div className=" flex gap-4">
                            <Button

                                type="button"
                                onClick={onClose}
                                className="h-10 w-full bg-background/90"
                            >
                                Cancel
                            </Button>

                            <Button
                                variant={"default"}
                                type="submit"
                                className="h-10 w-full"
                            >
                                Create GM
                            </Button>
                        </div>


                    </CardFooter>
                </Card>





            </div>
        </div>

    );
}