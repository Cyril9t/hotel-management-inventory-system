
import { KeyRound, ShieldCheck } from 'lucide-react';

export const CreatePasswordHeader = ({ firstName, lastName }: { firstName: string, lastName: string }) => (
    <header className="space-y-4 text-center sm:text-left">
        <div className='flex gap-10 '>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-accent/60 text-primary shadow-sm sm:mx-0">
                <KeyRound className="h-5 w-5" />
            </div>
            <div className="place-content-center">
                <h1 className="font-bold">{firstName} {lastName}</h1>
            </div>
        </div>
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Staff account setup</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Create your password</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose a strong password to activate your Brandy Hotel staff account.
            </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-success/20 bg-brand-success/5 px-3 py-1.5 text-[11px] font-medium text-brand-success">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Private invitation setup</span>
        </div>
    </header>
);
