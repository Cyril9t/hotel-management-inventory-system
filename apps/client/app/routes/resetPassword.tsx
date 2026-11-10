import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { RecoveryLayout, RecoveryMessage, getRecoveryError } from "~/components/Auth/RecoveryLayout";
import { resetPassword } from "~/services/auth";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token")?.trim() ?? "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [succeeded, setSucceeded] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isSubmitting || !token) return;
        setError("");
        if (password.length < 8) { setError("Your password must be at least 8 characters."); return; }
        if (password !== confirmPassword) { setError("The passwords do not match."); return; }
        setIsSubmitting(true);
        try {
            await resetPassword(token, password);
            setPassword("");
            setConfirmPassword("");
            setSucceeded(true);
        } catch (requestError) {
            setError(getRecoveryError(requestError, "This reset link is invalid or expired. Request a new password reset link and try again."));
        } finally {
            setIsSubmitting(false);
        }
    }

    return <RecoveryLayout><div className="w-full max-w-md mx-auto">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">Choose a new password for your account.</p>
        </div>
        {succeeded ? <div className="space-y-5">
            <RecoveryMessage kind="success">Your password has been reset successfully. You can now sign in with your new password.</RecoveryMessage>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
        </div> : !token ? <div className="space-y-5">
            <RecoveryMessage>This reset link is missing its token or is invalid. Request a new reset link to continue.</RecoveryMessage>
            <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline">Request a new reset link</Link>
        </div> : <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput id="new-password" label="New Password" value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} />
            <PasswordInput id="confirm-password" label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} visible={showConfirmation} onToggle={() => setShowConfirmation((visible) => !visible)} />
            <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
            {error && <RecoveryMessage>{error}</RecoveryMessage>}
            <Button type="submit" disabled={isSubmitting || !password || !confirmPassword} className="w-full h-10">{isSubmitting ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Updating…</> : "Reset Password"}</Button>
            <div className="pt-2"><Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Login</Link></div>
        </form>}
    </div></RecoveryLayout>;
}

function PasswordInput({ id, label, value, onChange, visible, onToggle }: { id: string; label: string; value: string; onChange: (value: string) => void; visible: boolean; onToggle: () => void }) {
    return <div className="space-y-1.5">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-foreground">{label}</label>
        <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input id={id} type={visible ? "text" : "password"} required minLength={8} autoComplete="new-password" value={value} onChange={(event) => onChange(event.target.value)} className="w-full pl-10 pr-12 py-2.5 text-sm rounded-[var(--radius)] border border-[var(--input)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all" />
            <Button type="button" variant="ghost" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={visible} onClick={onToggle} className="absolute inset-y-0 right-0 h-full px-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
        </div>
    </div>;
}
