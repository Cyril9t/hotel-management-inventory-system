import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PasswordRequirementsCard, type PasswordCriteria } from './passrequired';

export interface CreatePasswordFormProps {
    onSubmit: (password: string) => void;
    isSubmitting?: boolean;
}

export const CreatePasswordForm: React.FC<CreatePasswordFormProps> = ({
    onSubmit,
    isSubmitting = false,
}) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Criteria validation checks
    const criteria: PasswordCriteria = {
        minLength: password.length >= 8,
        hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const isPasswordValid = Object.values(criteria).every(Boolean);
    const passwordsMatch = password !== '' && password === confirmPassword;
    const canSubmit = isPasswordValid && passwordsMatch && !isSubmitting;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (canSubmit) {
            onSubmit(password);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">


            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                        <span>Your Password</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground pointer-events-none">
                            <Lock className="w-4 h-4" />
                        </span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new strong password"
                            className="h-11 w-full rounded-[var(--radius)] border border-input bg-background py-2.5 pl-10 pr-10 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        />
                        <button
                            type="button"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            aria-pressed={showPassword}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm  font-semibold text-foreground flex items-center justify-between">
                        <span >Confirm Password</span>
                        {passwordsMatch && (
                            <span className="text-[10px] font-bold text-brand-success flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Passwords Match
                            </span>
                        )}
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground pointer-events-none">
                            <Lock className="w-4 h-4" />
                        </span>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password to confirm"
                            className={`h-11 w-full rounded-[var(--radius)] border bg-background py-2.5 pl-10 pr-10 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${confirmPassword && !passwordsMatch
                                ? 'border-destructive/80 focus:ring-destructive'
                                : 'border-input'
                                }`}
                        />
                        <button
                            type="button"
                            aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                            aria-pressed={showConfirmPassword}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {confirmPassword && !passwordsMatch && (
                        <p className="text-[11px] text-destructive font-medium">Passwords do not match.</p>
                    )}
                </div>
            </div>

            <PasswordRequirementsCard criteria={criteria} />

            <button
                type="submit"
                disabled={!canSubmit}
                className="h-12 w-full rounded-[var(--radius)] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Setting password…</span>
                    </>
                ) : (
                    <>
                        <span>Activate account</span>
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>

        </form>
    );
};
