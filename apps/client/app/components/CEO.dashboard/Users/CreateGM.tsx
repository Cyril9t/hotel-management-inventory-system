import { useRef, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { UseMetricCards } from '~/Context/Context';
import { createStaffInvite } from '~/lib/invites';


export function CreateGMModal({ isOpen = true, onClose = () => { } }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneCode: '+234',
        phoneNumber: '',
    });
    const { api } = UseMetricCards();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const submissionInProgress = useRef(false);

    if (!isOpen) return null;


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submissionInProgress.current) return;

        submissionInProgress.current = true;
        setIsSubmitting(true);
        setFeedback(null);
        try {
            const resp = await createStaffInvite(api, {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                phone: `${formData.phoneCode}${formData.phoneNumber.trim()}`,
                role: 'GENERAL_MANAGER',
            });

            const data = await resp.data
            console.log(data)

            setFormData({ firstName: '', lastName: '', email: '', phoneCode: '+234', phoneNumber: '' });
            setFeedback({
                type: 'success',
                message: `Invitation created for ${formData.email.trim()}. They must accept the invitation to activate their account.`,
            });
        } catch (error: any) {
            setFeedback({
                type: 'error',
                message: error?.response?.data?.error?.message ?? error?.message ?? 'Could not create the invitation. Please try again.',
            });
        } finally {
            submissionInProgress.current = false;
            setIsSubmitting(false);
        }
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
                                    disabled={isSubmitting}
                                    className="h-10 w-10 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </CardAction>

                        </div>

                    </CardHeader>

                    <CardContent>
                        <form id="create-gm-invite-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                            {feedback && (
                                <div role={feedback.type === 'error' ? 'alert' : 'status'} aria-live="polite"
                                    className={`rounded-md border p-3 text-sm ${feedback.type === 'success' ? 'border-green-600/30 bg-green-600/10 text-green-800' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
                                    {feedback.message}
                                </div>
                            )}


                            <div>


                                <h3 className="font-semibold text-foreground mb-4">
                                    General Manager Details
                                </h3>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter full name"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full px-3.5 py-2 text-[12px] font-semibold rounded-[10px] border-2 border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter last name"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                                                defaultValue="GENERAL_MANAGER"
                                                className="w-full appearance-none px-3.5 py-2 text-xs rounded-[10px] border-2 border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
                                            >
                                                <option value="GENERAL_MANAGER">General Manager</option>
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                                <br />
                            </div>
                        </form>

                    </CardContent>

                    <CardFooter className='justify-center bg-brand-navy-light' >

                        <div className=" flex gap-4">
                            <Button

                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="h-10 w-full bg-background/90"
                            >
                                Cancel
                            </Button>

                            <Button
                                variant={"default"}
                                type="submit"
                                form="create-gm-invite-form"
                                disabled={isSubmitting}
                                className="h-10 w-full"
                            >
                                {isSubmitting ? 'Sending…' : 'Create GM'}
                            </Button>
                        </div>


                    </CardFooter>
                </Card>





            </div>
        </div>

    );
}
