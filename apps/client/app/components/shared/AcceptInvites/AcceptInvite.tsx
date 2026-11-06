import { useState, type FC } from 'react';
import { ArrowRight, CheckCircle2, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { CreatePasswordHeader } from './header';
import { CreatePasswordForm } from './createPassword';
import Logo from '../Logo';
import { Button } from '~/components/ui/button';
import { UseMetricCards } from '~/Context/Context';
import { useNavigate, useSearchParams } from 'react-router';

function inviteErrorMessage(error: any) {
    return error?.response?.data?.error?.message
        ?? error?.response?.data?.message
        ?? error?.message
        ?? 'We could not verify this invitation. Ask your administrator for a new invite link.';
}

export const CreatePassword: FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const { api } = UseMetricCards();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const firstName = searchParams.get('firstName') as string;
    const lastName = searchParams.get("lastName") as string;

    const navigate = useNavigate();

    const handlePasswordSubmit = async (password: string) => {
        if (!token || isSubmitting) return;
        setIsSubmitting(true);
        setSubmitError('');

        try {
            await api.post('users/invites/accept', { password, token });
            setIsSuccess(true);
        } catch (error: any) {
            setSubmitError(inviteErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="h-screen  text-foreground lg:grid lg:grid-cols-2">
            <section className="relative hidden h-screen overflow-hidden  p-10 text-background lg:flex lg:flex-col lg:justify-between xl:p-14">
                <div className="absolute inset-0" aria-hidden="true">
                    <img
                        src="https://i.pinimg.com/1200x/0f/7c/35/0f7c35c2c0f458f4188742f9de3f6eee.jpg"
                        alt=""
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-br/20 from-brand-navy/95 via-brand-navy/75 to-brand-navy/45" />
                    <div className="absolute -bottom-28 -left-24 h-96 w-96 rounded-full border border-brand-gold-light/20" />
                    <div className="absolute -bottom-16 -left-12 h-72 w-72 rounded-full border border-brand-gold-light/20" />
                </div>

                <div className="relative z-10 flex justify-end">
                    <span className="rounded-full border border-brand-gold-light/25 bg-brand-navy/50 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-brand-gold-light backdrop-blur-sm">
                        Staff account setup
                    </span>
                </div>

                <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center text-center">
                    <Logo variant="hero" logoColor="#172536" textColor="#f2c66d" />
                    <div className="mt-12 max-w-md">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-gold-light/30 bg-brand-gold-light/10 text-brand-gold-light shadow-lg shadow-black/10">
                            <KeyRound className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold-light">Welcome to the team</p>
                        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-background xl:text-4xl">
                            Your next chapter starts here.
                        </h1>
                        <p className="mt-4 text-sm leading-6 text-background/75">
                            Create your password to activate your staff account and access the Brandy Hotel management portal.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between gap-4 text-[11px] text-background/70">
                    <p>© {new Date().getFullYear()} Brandy Hotel Group</p>
                    <p className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand-gold-light" /> Private staff access</p>
                </div>
            </section>

            <section className="flex flex-col ">
                <div className="mb-8 flex items-center justify-between lg:hidden">
                    <Logo variant="default" logoColor="#172536" />
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                        <LockKeyhole className="h-3 w-3" /> Invite only
                    </span>
                </div>

                <div className="mx-auto my-auto w-full max-w-xl py-4">
                    {/* <div className="mb-6 hidden lg:block">
                        <Logo variant="default" logoColor="#172536" />
                    </div> */}

                    {isSuccess ? (
                        <div className="rounded-2xl border border-brand-success/25 bg-card p-6 shadow-xl shadow-brand-navy/5 sm:p-9">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-success/10 text-brand-success">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                            <div className="mt-5 text-center">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-success">Account activated</p>
                                <h2 className="mt-2 text-2xl font-bold tracking-tight">Password created</h2>
                                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                    Your staff account is ready. Sign in with your email and the password you just created.
                                </p>
                            </div>
                            <Button onClick={() => navigate('/', { replace: true })} className="mt-7 h-12 w-full gap-2 font-semibold">
                                Continue to sign in <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : !token ? (
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-brand-navy/5 sm:p-9">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                                <KeyRound className="h-6 w-6" />
                            </div>
                            <div className="mt-5 text-center">
                                <h1 className="text-2xl font-bold tracking-tight">Invite link incomplete</h1>
                                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                    This page needs the personal invite link sent to you. Ask your hotel administrator to resend your invitation.
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => navigate('/', { replace: true })} className="mt-7 h-12 w-full">
                                Return to sign in
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-brand-navy/5 sm:p-9">

                            <CreatePasswordHeader firstName={firstName} lastName={lastName} />


                            {submitError && <div role="alert" aria-live="polite" className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive">{submitError}</div>}
                            <div className="mt-7">
                                <CreatePasswordForm onSubmit={handlePasswordSubmit} isSubmitting={isSubmitting} />
                            </div>
                            <p className="mt-6 border-t border-border pt-5 text-center text-xs leading-5 text-muted-foreground">
                                Having trouble with your invitation? Contact your hotel administrator for assistance.
                            </p>
                        </div>
                    )}


                </div>
            </section>
        </main>
    );
};

export default CreatePassword;
