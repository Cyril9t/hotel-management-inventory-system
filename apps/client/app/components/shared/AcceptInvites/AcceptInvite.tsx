import React, { use, useState } from 'react';
import { CreatePasswordHeader } from './header';
import { CreatePasswordForm } from './createPassword';
import { Lock, ShieldCheck } from 'lucide-react';
import Logo from '../Logo';
import { Button } from '~/components/ui/button';
import { UseMetricCards } from '~/Context/Context';
import { useNavigate, useSearchParams } from 'react-router';

export const CreatePassword: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { api } = UseMetricCards()

    const [searchParams] = useSearchParams()

    const token = searchParams.get("token")


    const navigate = useNavigate();

    const handlePasswordSubmit = async (password: string) => {
        setIsSubmitting(true);

        try {

            const verifyToken = await api.post(`users/invites/${token}/verify`)
            const verify = await verifyToken.data

            console.log(verify);

            await api.post("users/invites/accept", { password: password, token: token })

            setIsSuccess(true);
            setIsSubmitting(false);
        } catch (error) {
            console.log(error)
            setIsSubmitting(false);
            setIsSuccess(false);
        }
    };

    return (
        <div className="h-screen bg-brand-navy-light/40 text-foreground flex flex-col justify-center items-center p-4 sm:p-6">


            <div className="w-9xl bg-background border border-border rounded-(--radius) shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
                <Logo variant='hero' textColor='#24384d' />

                {isSuccess ? (
                    <div className="p-6 rounded-xl border border-brand-navy bg-brand-success/10 text-center space-y-4 animate-in fade-in duration-400">
                        <div className="w-15 h-15 rounded-full bg-brand-success text-background border border-brand-success flex items-center justify-center mx-auto">
                            <ShieldCheck className="w-8 h-8 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">Password Created Successfully!</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Your credentials have been updated securely. You can now log into your Brandy Hotel dashboard.
                            </p>
                        </div>

                        <Button
                            onClick={
                                () => {

                                    navigate("/", { replace: true })
                                }
                            }
                            className="w-full h-12 font-bold text-[16px]"
                        >
                            Back to Login
                        </Button>
                    </div>
                ) : (
                    <div className='flex flex-col gap-6'>
                        <CreatePasswordHeader />

                        <CreatePasswordForm
                            onSubmit={handlePasswordSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                )}


                <div className="pt-4 border-t border-border text-center flex items-center justify-center gap-1.5 text-[14px] text-muted-foreground">
                    <Lock className="w-4 h-4 text-primary" />
                    <span>Brandy Boutique Grand Resort • System v1.0.0</span>
                </div>

            </div>
        </div>
    );
};

export default CreatePassword;