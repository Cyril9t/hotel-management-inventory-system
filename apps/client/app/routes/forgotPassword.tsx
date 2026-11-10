import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import { RecoveryLayout, RecoveryMessage, getRecoveryError } from "~/components/Auth/RecoveryLayout";
import { requestPasswordReset } from "~/services/auth";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isSubmitting) return;
        setError("");
        setIsSubmitting(true);
        try {
            await requestPasswordReset(email.trim());
            setSubmitted(true);
        } catch (requestError) {
            setError(getRecoveryError(requestError, "We couldn't process your request. Please try again."));
        } finally {
            setIsSubmitting(false);
        }
    }

    return <RecoveryLayout><div className="w-full max-w-md mx-auto">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Forgot Password?</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your registered email and we’ll send instructions to reset your password.</p>
        </div>
        {submitted ? <div className="space-y-5">
            <RecoveryMessage kind="success">If an account exists for <strong>{email.trim()}</strong>, password reset instructions have been sent.</RecoveryMessage>
            <p className="text-sm text-muted-foreground">Check your inbox and follow the link to choose a new password.</p>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
        </div> : <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label htmlFor="recovery-email" className="text-xs font-semibold uppercase tracking-wider text-foreground">Email address</label>
                <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input id="recovery-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@hotel.com" className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[var(--radius)] border border-[var(--input)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all" />
                </div>
                {error && <RecoveryMessage>{error}</RecoveryMessage>}
            </div>
            <Button type="submit" disabled={isSubmitting || !email.trim()} className="w-full h-10">{isSubmitting ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Sending…</> : "Send Reset Instructions"}</Button>
            <div className="pt-2"><Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Login</Link></div>
        </form>}
    </div></RecoveryLayout>;
}
